import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { FORMATION_NAMES, FORMATION_COLORS, FORMATION_CHAIN_CONFIG, LIVING_MOTION, computeFormationPositions } from './formations'

// Register THREE.Line as 'ThreeLine' so <threeLine> works at runtime
extend({ ThreeLine: THREE.Line })

const TOTAL_COUNT = 10000
const MAX_CHAIN_LENGTH_UPPER = 20 // upper bound for buffer allocation
const AUTO_CYCLE_INTERVAL = 10 // seconds
const CAMERA_Z = 2 // camera position z, must match App.tsx camera config
const MIN_Z_DIST = 0.1 // minimum distance from camera to prevent numerical issues
const CHAIN_MEMBER_VEL_AMP_CAP = 2.0 // max velAmp for chain member particles
const CHAIN_SMOOTH_FACTOR = 0.15 // smoothed position lerp rate per frame

// Pre-allocated chain membership lookup (avoids per-frame Set allocation)
const chainMemberFlags = new Uint8Array(TOTAL_COUNT)

// Per-particle fade buffer (mutated each frame for milkyway waterfall)
const particleFades = new Float32Array(TOTAL_COUNT)
particleFades.fill(1.0)

// Seeded random for deterministic initialization
function seededRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

// ==================== Shaders ====================

const vertexShader = `
  attribute float size;
  attribute float phase;
  attribute float fade;
  
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uMorphProgress;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    float colorMix = uMorphProgress;
    vec3 baseColor = mix(uColorA, uColorB, colorMix);
    
    float hueShift = sin(phase * 6.2831 + uTime * 0.3) * 0.1;
    baseColor += vec3(hueShift, -hueShift * 0.5, hueShift * 0.3);
    
    vColor = baseColor;
    vAlpha = fade;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float pulsate = 1.0 + sin(uTime * 1.5 + phase * 6.2831) * 0.1;
    gl_PointSize = size * uPixelRatio * 3.5 * pulsate * fade * (1.0 / -mvPosition.z);
  }
`

const fragmentShader = `
  uniform vec2 uMousePos;
  uniform float uMouseSpeed;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    
    float alpha = exp(-dist * dist * 22.0);
    float core = exp(-dist * dist * 60.0) * 3.0;
    
    vec3 finalColor = vColor * alpha + vec3(core);
    
    if (alpha < 0.03) discard;
    
    gl_FragColor = vec4(finalColor, alpha * vAlpha);
  }
`

const lineVertexShader = `
  attribute float opacity;
  attribute vec3 lineColor;
  varying float vOpacity;
  varying vec3 vLineColor;
  void main() {
    vOpacity = opacity;
    vLineColor = lineColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const lineFragmentShader = `
  varying float vOpacity;
  varying vec3 vLineColor;
  void main() {
    gl_FragColor = vec4(vLineColor * (1.0 + vOpacity * 2.0), vOpacity);
  }
`

// ==================== Easing ====================

// Smooth, elegant easing - no bounce/overshoot
function smootherstep(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t * t * t * (t * (t * 6 - 15) + 10)
}

// Smoothstep mapping from range [edge0, edge1] to [0, 1]
function smoothstepRange(x: number, edge0: number, edge1: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

// Multi-frequency noise for spiral curvature (no external dependency)
function curvatureNoise(t: number): number {
  return Math.sin(t * 0.3) * Math.cos(t * 0.17) + Math.sin(t * 0.07) * 0.5 + Math.cos(t * 0.43) * 0.3
}

// ==================== Pre-computed data (outside component for purity) ====================

function createParticleData() {
  const positions = new Float32Array(TOTAL_COUNT * 3)
  const targetPositions = new Float32Array(TOTAL_COUNT * 3)
  const sizes = new Float32Array(TOTAL_COUNT)
  const phases = new Float32Array(TOTAL_COUNT)

  computeFormationPositions('diffuse', TOTAL_COUNT, targetPositions)

  for (let i = 0; i < TOTAL_COUNT; i++) {
    const i3 = i * 3
    positions[i3] = targetPositions[i3]
    positions[i3 + 1] = targetPositions[i3 + 1]
    positions[i3 + 2] = targetPositions[i3 + 2]

    sizes[i] = 0.8 + seededRand(i * 7 + 1) * 0.6
    phases[i] = seededRand(i * 13 + 5)
  }

  return { positions, targetPositions, sizes, phases }
}

function createStaggerDelays() {
  const arr = new Float32Array(TOTAL_COUNT)
  for (let i = 0; i < TOTAL_COUNT; i++) {
    arr[i] = seededRand(i * 97 + 13) * 1.0
  }
  return arr
}

function createLineData() {
  const linePositions = new Float32Array((MAX_CHAIN_LENGTH_UPPER + 1) * 3)
  const lineOpacities = new Float32Array(MAX_CHAIN_LENGTH_UPPER + 1)
  const lineColors = new Float32Array((MAX_CHAIN_LENGTH_UPPER + 1) * 3)
  lineColors.fill(1)
  return { linePositions, lineOpacities, lineColors }
}

// Module-level shaderUniforms (mutable outside React, safe to pass to JSX)
const shaderUniforms = {
  uTime: { value: 0 },
  uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
  uColorA: { value: new THREE.Vector3(...FORMATION_COLORS.diffuse.a) },
  uColorB: { value: new THREE.Vector3(...FORMATION_COLORS.diffuse.b) },
  uMorphProgress: { value: 0 },
  uMousePos: { value: new THREE.Vector2(0, 0) },
  uMouseSpeed: { value: 0 },
}

// ==================== Component ====================

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  const lineRef = useRef<THREE.Line>(null)
  const { viewport } = useThree()

  // Store accessors
  const nextFormation = useStore((s) => s.nextFormation)
  const prevFormation = useStore((s) => s.prevFormation)
  const setMorphProgress = useStore((s) => s.setMorphProgress)

  // Auto-cycle timer ref
  const autoTimerRef = useRef(0)
  const lastFormationRef = useRef(0)

  // Morph state
  const morphTimeRef = useRef(0)
  const isMorphing = useRef(false)
  const morphDuration = 3.5

  // Living formation trajectory recomputation throttle
  const throttleCounterRef = useRef(0)

  // Color interpolation refs
  const prevColorARef = useRef(new THREE.Vector3(...FORMATION_COLORS.diffuse.a))
  const prevColorBRef = useRef(new THREE.Vector3(...FORMATION_COLORS.diffuse.b))
  const targetColorARef = useRef(new THREE.Vector3(...FORMATION_COLORS.diffuse.a))
  const targetColorBRef = useRef(new THREE.Vector3(...FORMATION_COLORS.diffuse.b))

  // Chain config interpolation refs
  const prevChainConfigRef = useRef(FORMATION_CHAIN_CONFIG.diffuse)
  const targetChainConfigRef = useRef(FORMATION_CHAIN_CONFIG.diffuse)

  // All mutable buffers stored in refs
  const prevPositionsRef = useRef(new Float32Array(TOTAL_COUNT * 3))
  const velocitiesRef = useRef(new Float32Array(TOTAL_COUNT * 3))
  const liveTargetRef = useRef(new Float32Array(TOTAL_COUNT * 3))
  const rawTargetRef = useRef(new Float32Array(TOTAL_COUNT * 3))
  const staggerDelaysRef = useRef(createStaggerDelays())

  // Particle data (created once via lazy initializer, stable for render + useFrame)
  const [particleData] = useState(createParticleData)
  const { positions, targetPositions, sizes, phases } = particleData

  // Line data (created once via lazy initializer)
  const [lineData] = useState(createLineData)
  const { linePositions, lineOpacities, lineColors } = lineData

  // Click effect state
  const clickRef = useRef<{
    type: string; x: number; y: number; time: number
    active: boolean; holdDuration: number; phase: string
  }>({ type: 'none', x: 0, y: 0, time: 0, active: false, holdDuration: 0, phase: 'attract' })

  // Long press state
  const longPressRef = useRef<{
    active: boolean; x: number; y: number; startTime: number
    released: boolean; releaseTime: number; holdDuration: number
  }>({ active: false, x: 0, y: 0, startTime: 0, released: false, releaseTime: 0, holdDuration: 0 })

  // Light chain state — dynamic chase system
  const chainRef = useRef<number[]>([0])
  const headPosRef = useRef({ x: positions[0], y: positions[1] })
  const headDirRef = useRef({ x: Math.cos(seededRand(42) * 6.2831), y: Math.sin(seededRand(42) * 6.2831) })
  const chaseWeightRef = useRef(0)
  const spiralAngleRef = useRef(0)

  // Milkyway relative time: tracks when milkyway living motion starts
  const milkywayStartTimeRef = useRef(-1)

  // Magnetic field interaction state
  const dwellTimeRef = useRef(0)
  const prevMouseWorldRef = useRef({ x: 0, y: 0 })
  const lastRotDirRef = useRef(1) // inertial rotation direction for dwell
  const chainSmoothedPositionsRef = useRef(new Float32Array(MAX_CHAIN_LENGTH_UPPER * 3))
  const prevChainRef = useRef<number[]>([])

  // Handle pointer events for click effects
  const pointerDownTime = useRef(0)
  const pointerDownPos = useRef({ x: 0, y: 0 })

  const handlePointerDown = useCallback((e: PointerEvent) => {
    const x = ((e.clientX / window.innerWidth) * 2 - 1) * viewport.width * 0.5
    const y = -((e.clientY / window.innerHeight) * 2 - 1) * viewport.height * 0.5
    pointerDownTime.current = Date.now()
    pointerDownPos.current = { x, y }
    longPressRef.current = {
      active: true, x, y, startTime: Date.now(),
      released: false, releaseTime: 0, holdDuration: 0,
    }
  }, [viewport])

  const handlePointerUp = useCallback(() => {
    const holdDuration = (Date.now() - pointerDownTime.current) / 1000
    if (longPressRef.current.active && holdDuration > 0.3) {
      longPressRef.current.released = true
      longPressRef.current.releaseTime = Date.now()
      longPressRef.current.holdDuration = holdDuration
    } else if (holdDuration <= 0.3) {
      clickRef.current = {
        type: 'shockwave', x: pointerDownPos.current.x, y: pointerDownPos.current.y,
        time: 0, active: true, holdDuration: 0, phase: 'explode',
      }
    }
    if (holdDuration <= 0.3) {
      longPressRef.current.active = false
    }
  }, [])

  const handleDblClick = useCallback((e: MouseEvent) => {
    const x = ((e.clientX / window.innerWidth) * 2 - 1) * viewport.width * 0.5
    const y = -((e.clientY / window.innerHeight) * 2 - 1) * viewport.height * 0.5
    clickRef.current = {
      type: 'blackhole', x, y, time: 0, active: true, holdDuration: 0, phase: 'attract',
    }
    longPressRef.current.active = false
  }, [viewport])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const store = useStore.getState()
    if (store.formation.morphProgress < 1) return
    if (e.deltaY > 0) nextFormation()
    else prevFormation()
    autoTimerRef.current = 0
  }, [nextFormation, prevFormation])

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('dblclick', handleDblClick)
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('dblclick', handleDblClick)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [handlePointerDown, handlePointerUp, handleDblClick, handleWheel])

  // ==================== Animation Loop ====================

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    const time = state.clock.elapsedTime
    const geometry = pointsRef.current.geometry
    const posAttr = geometry.attributes.position as THREE.BufferAttribute
    const prevPositions = prevPositionsRef.current
    const velocities = velocitiesRef.current
    const staggerDelays = staggerDelaysRef.current

    const storeState = useStore.getState()
    const mouse = storeState.mouse
    const formation = storeState.formation

    // Update shaderUniforms
    shaderUniforms.uTime.value = time
    const mx = (mouse.x / window.innerWidth) * 2 - 1
    const my = -((mouse.y / window.innerHeight) * 2 - 1)
    shaderUniforms.uMousePos.value.set(mx * viewport.width * 0.5, my * viewport.height * 0.5)
    shaderUniforms.uMouseSpeed.value = mouse.speed

    // ===== Mouse world position & magnetic field state =====
    const mouseWorldX = mx * viewport.width * 0.5
    const mouseWorldY = my * viewport.height * 0.5

    // Mouse velocity direction (frame-to-frame world-space delta)
    const mouseVelX = mouseWorldX - prevMouseWorldRef.current.x
    const mouseVelY = mouseWorldY - prevMouseWorldRef.current.y
    prevMouseWorldRef.current.x = mouseWorldX
    prevMouseWorldRef.current.y = mouseWorldY

    // Dwell time: accumulate when slow, decay when fast
    if (mouse.speed < 1) {
      dwellTimeRef.current += delta
    } else if (mouse.speed > 2) {
      dwellTimeRef.current *= 0.9
    }
    const dwellStrength = 1 + smoothstepRange(dwellTimeRef.current, 0, 4) * 2

    // Continuous speed-force transition
    const radialSign = smoothstepRange(mouse.speed, 1, 6) * 2 - 1
    const tangentialScale = 0.5 + smoothstepRange(mouse.speed, 1, 6) * 0.5

    // Update inertial rotation direction from mouse velocity
    const mouseVelLen = Math.sqrt(mouseVelX * mouseVelX + mouseVelY * mouseVelY)
    if (mouseVelLen > 0.001) {
      lastRotDirRef.current = (mouseVelX * mouseVelY > 0) ? 1 : -1
    }

    // ===== Formation morphing =====
    if (formation.targetIndex !== lastFormationRef.current && !isMorphing.current) {
      isMorphing.current = true
      morphTimeRef.current = 0

      for (let i = 0; i < TOTAL_COUNT * 3; i++) {
        prevPositions[i] = posAttr.array[i]
      }

      // Save old colors for smooth interpolation
      prevColorARef.current.copy(shaderUniforms.uColorA.value)
      prevColorBRef.current.copy(shaderUniforms.uColorB.value)

      // Save old chain config for smooth interpolation
      prevChainConfigRef.current = targetChainConfigRef.current

      const targetName = FORMATION_NAMES[formation.targetIndex]
      computeFormationPositions(targetName, TOTAL_COUNT, targetPositions)

      const colors = FORMATION_COLORS[targetName]
      targetColorARef.current.set(...colors.a)
      targetColorBRef.current.set(...colors.b)

      // Set target chain config
      targetChainConfigRef.current = FORMATION_CHAIN_CONFIG[targetName]

      // Clear old chain immediately — stale nodes from old formation look messy
      chainRef.current.length = 0

      lastFormationRef.current = formation.targetIndex
    }

    if (isMorphing.current) {
      morphTimeRef.current += delta
      const rawProgress = Math.min(1, morphTimeRef.current / morphDuration)

      // Smooth color transition
      const colorT = smootherstep(rawProgress)
      shaderUniforms.uColorA.value.lerpVectors(prevColorARef.current, targetColorARef.current, colorT)
      shaderUniforms.uColorB.value.lerpVectors(prevColorBRef.current, targetColorBRef.current, colorT)

      for (let i = 0; i < TOTAL_COUNT; i++) {
        const i3 = i * 3
        const staggeredTime = Math.max(0, morphTimeRef.current - staggerDelays[i])
        const t = Math.min(1, staggeredTime / (morphDuration - 1.0))
        const eased = smootherstep(t)

        posAttr.array[i3] = prevPositions[i3] + (targetPositions[i3] - prevPositions[i3]) * eased
        posAttr.array[i3 + 1] = prevPositions[i3 + 1] + (targetPositions[i3 + 1] - prevPositions[i3 + 1]) * eased
        posAttr.array[i3 + 2] = prevPositions[i3 + 2] + (targetPositions[i3 + 2] - prevPositions[i3 + 2]) * eased

        // Velocity damping (merged into morph loop)
        velocities[i3] *= 0.95
        velocities[i3 + 1] *= 0.95
        velocities[i3 + 2] *= 0.95
      }

      shaderUniforms.uMorphProgress.value = rawProgress
      setMorphProgress(rawProgress)

      if (rawProgress >= 1) {
        isMorphing.current = false
        // Seed live target buffer with final morph positions for smooth living motion start
        liveTargetRef.current.set(targetPositions)
        // Record milkyway start time for relative time in formation generator
        const targetName = FORMATION_NAMES[formation.targetIndex]
        if (targetName === 'milkyway') {
          milkywayStartTimeRef.current = time
        } else {
          milkywayStartTimeRef.current = -1
        }
      }
    } else {
      // Living motion: compute raw targets into temp buffer, smoothly lerp live buffer toward them
      const currentName = FORMATION_NAMES[formation.currentIndex]
      const isLiving = !!LIVING_MOTION[currentName]

      if (isLiving) {
        const rawTarget = rawTargetRef.current
        const liveTarget = liveTargetRef.current
        const isMilkyway = currentName === 'milkyway' && milkywayStartTimeRef.current >= 0

        if (isMilkyway) {
          // Milkyway: recompute every frame — falling particles need frame-accurate positions
          const relTime = time - milkywayStartTimeRef.current
          computeFormationPositions(currentName, TOTAL_COUNT, liveTarget, relTime)
        } else {
          // Other formations: throttle recomputation (slow parameter drift)
          throttleCounterRef.current++
          if (throttleCounterRef.current % 10 === 0) {
            computeFormationPositions(currentName, TOTAL_COUNT, rawTarget, time)
          }
          const lerpRate = Math.min(1, delta * 2.0)
          for (let i = 0; i < TOTAL_COUNT * 3; i++) {
            liveTarget[i] += (rawTarget[i] - liveTarget[i]) * lerpRate
          }
        }
      }

      // Use smoothed live targets for living formations, static targets otherwise
      const base = isLiving ? liveTargetRef.current : targetPositions
      const t05 = time * 0.5
      const t04 = time * 0.4
      const t03 = time * 0.3

      // Magnetic field constants
      const magnetRadius = 0.9
      const baseTangential = 0.006
      const baseRadial = 0.004
      const lastRotDir = lastRotDirRef.current

      // Mark chain members before main loop so velAmp can be capped
      const chain = chainRef.current
      for (let ci = 0; ci < chain.length; ci++) {
        chainMemberFlags[chain[ci]] = 1
      }

      for (let i = 0; i < TOTAL_COUNT; i++) {
        const i3 = i * 3
        const p628 = phases[i] * 6.28

        // Compute base position with breath
        const bx = base[i3] + Math.sin(t05 + p628) * 0.008
        const by = base[i3 + 1] + Math.cos(t04 + p628 + 1) * 0.008
        const bz = base[i3 + 2] + Math.sin(t03 + p628 + 2) * 0.005

        // Magnetic field force + velocity amplification
        const pz = bz + velocities[i3 + 2]
        const zScale = Math.max(MIN_Z_DIST, CAMERA_Z - pz) / CAMERA_Z
        const adjMx = mouseWorldX * zScale
        const adjMy = mouseWorldY * zScale
        const radius = magnetRadius * zScale
        const rSq = radius * radius

        const rx = bx + velocities[i3] - adjMx
        const ry = by + velocities[i3 + 1] - adjMy
        const distSq = rx * rx + ry * ry

        let velAmp = 1.0
        if (distSq < rSq && distSq > 0.0001) {
          // Soft quadratic falloff: full range of radius feels the force
          const falloff = 1 - distSq / rSq

          const dist = Math.sqrt(distSq)
          const rnx = rx / dist
          const rny = ry / dist
          const tnx = -rny
          const tny = rnx

          // Rotation direction: cross product or inertial
          const cross = mouseVelX * ry - mouseVelY * rx
          const rotDir = Math.abs(cross) > 0.0001 ? (cross > 0 ? 1 : -1) : lastRotDir

          // Forces with soft falloff and dwell strengthening
          const tForce = baseTangential * tangentialScale * falloff * dwellStrength * rotDir
          const rForce = baseRadial * radialSign * falloff * dwellStrength

          velocities[i3] += tnx * tForce + rnx * rForce
          velocities[i3 + 1] += tny * tForce + rny * rForce

          // Formation tear: amplify velocity near mouse (up to 12x at center)
          velAmp = 1 + falloff * 11
          if (chainMemberFlags[i]) {
            velAmp = Math.min(velAmp, CHAIN_MEMBER_VEL_AMP_CAP)
          }
        }

        posAttr.array[i3] = bx + velocities[i3] * velAmp
        posAttr.array[i3 + 1] = by + velocities[i3 + 1] * velAmp
        posAttr.array[i3 + 2] = bz + velocities[i3 + 2]

        // Velocity damping
        velocities[i3] *= 0.95
        velocities[i3 + 1] *= 0.95
        velocities[i3 + 2] *= 0.95
      }
    }

    // ===== Click effects (squared distance early-out) =====

    // Shockwave
    if (clickRef.current.active && clickRef.current.type === 'shockwave') {
      clickRef.current.time += delta
      const ct = clickRef.current.time
      const baseRingRadius = ct * 1.5
      const baseRingWidth = 0.2
      const cx = clickRef.current.x
      const cy = clickRef.current.y
      for (let i = 0; i < TOTAL_COUNT; i++) {
        const i3 = i * 3
        const pz = posAttr.array[i3 + 2]
        const zScale = Math.max(MIN_Z_DIST, CAMERA_Z - pz) / CAMERA_Z
        const adjCx = cx * zScale
        const adjCy = cy * zScale
        const ringRadius = baseRingRadius * zScale
        const ringWidth = baseRingWidth * zScale
        const outerSq = (ringRadius + ringWidth) * (ringRadius + ringWidth)
        const innerR = Math.max(0, ringRadius - ringWidth)
        const innerSq = innerR * innerR
        const dx = posAttr.array[i3] - adjCx
        const dy = posAttr.array[i3 + 1] - adjCy
        const distSq = dx * dx + dy * dy
        if (distSq > outerSq || distSq < innerSq) continue
        const dist = Math.sqrt(distSq)
        const distFromRing = Math.abs(dist - ringRadius)
        if (distFromRing < ringWidth && dist > 0.01) {
          const strength = (1 - distFromRing / ringWidth) * (1 - ct / 2) * 0.08
          velocities[i3] += (dx / dist) * strength
          velocities[i3 + 1] += (dy / dist) * strength
        }
      }
      if (ct > 2) clickRef.current.active = false
    }

    // Black hole (double-click)
    if (clickRef.current.active && clickRef.current.type === 'blackhole') {
      clickRef.current.time += delta
      const ct = clickRef.current.time
      const cx = clickRef.current.x
      const cy = clickRef.current.y
      const baseRadius = 1.5
      if (ct < 1.0) {
        for (let i = 0; i < TOTAL_COUNT; i++) {
          const i3 = i * 3
          const pz = posAttr.array[i3 + 2]
          const zScale = Math.max(MIN_Z_DIST, CAMERA_Z - pz) / CAMERA_Z
          const adjCx = cx * zScale
          const adjCy = cy * zScale
          const radius = baseRadius * zScale
          const radiusSq = radius * radius
          const dx = adjCx - posAttr.array[i3]
          const dy = adjCy - posAttr.array[i3 + 1]
          const distSq = dx * dx + dy * dy
          if (distSq < radiusSq && distSq > 0.0004) {
            const dist = Math.sqrt(distSq)
            const strength = (1 - dist / radius) * 0.02
            const angle = Math.atan2(dy, dx)
            const tangentAngle = angle + Math.PI * 0.3
            velocities[i3] += Math.cos(tangentAngle) * strength + dx / dist * strength * 0.5
            velocities[i3 + 1] += Math.sin(tangentAngle) * strength + dy / dist * strength * 0.5
          }
        }
      } else if (ct < 1.2) {
        const explodeStrength = (1 - (ct - 1.0) / 0.2) * 0.15
        for (let i = 0; i < TOTAL_COUNT; i++) {
          const i3 = i * 3
          const pz = posAttr.array[i3 + 2]
          const zScale = Math.max(MIN_Z_DIST, CAMERA_Z - pz) / CAMERA_Z
          const adjCx = cx * zScale
          const adjCy = cy * zScale
          const radius = baseRadius * zScale
          const radiusSq = radius * radius
          const dx = posAttr.array[i3] - adjCx
          const dy = posAttr.array[i3 + 1] - adjCy
          const distSq = dx * dx + dy * dy
          if (distSq < radiusSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq)
            velocities[i3] += (dx / dist) * explodeStrength
            velocities[i3 + 1] += (dy / dist) * explodeStrength
          }
        }
      } else if (ct > 3) {
        clickRef.current.active = false
      }
    }

    // Long press: gravitational collapse
    if (longPressRef.current.active && !longPressRef.current.released) {
      const holdTime = (Date.now() - longPressRef.current.startTime) / 1000
      if (holdTime > 0.3) {
        const baseRadius = 0.5 + holdTime * 0.3
        const collapseForce = 0.005 + holdTime * 0.003
        const lpx = longPressRef.current.x
        const lpy = longPressRef.current.y
        for (let i = 0; i < TOTAL_COUNT; i++) {
          const i3 = i * 3
          const pz = posAttr.array[i3 + 2]
          const zScale = Math.max(MIN_Z_DIST, CAMERA_Z - pz) / CAMERA_Z
          const adjLpx = lpx * zScale
          const adjLpy = lpy * zScale
          const radius = baseRadius * zScale
          const radiusSq = radius * radius
          const dx = adjLpx - posAttr.array[i3]
          const dy = adjLpy - posAttr.array[i3 + 1]
          const distSq = dx * dx + dy * dy
          if (distSq < radiusSq && distSq > 0.0004) {
            const dist = Math.sqrt(distSq)
            const strength = (1 - dist / radius) * collapseForce
            velocities[i3] += (dx / dist) * strength
            velocities[i3 + 1] += (dy / dist) * strength
          }
        }
      }
    }

    // Long press release explosion
    if (longPressRef.current.released) {
      const releaseElapsed = (Date.now() - longPressRef.current.releaseTime) / 1000
      if (releaseElapsed < 0.3) {
        const explodeForce = longPressRef.current.holdDuration * 0.1
        const lpx = longPressRef.current.x
        const lpy = longPressRef.current.y
        const baseRadius = 2.0
        for (let i = 0; i < TOTAL_COUNT; i++) {
          const i3 = i * 3
          const pz = posAttr.array[i3 + 2]
          const zScale = Math.max(MIN_Z_DIST, CAMERA_Z - pz) / CAMERA_Z
          const adjLpx = lpx * zScale
          const adjLpy = lpy * zScale
          const radius = baseRadius * zScale
          const radiusSq = radius * radius
          const dx = posAttr.array[i3] - adjLpx
          const dy = posAttr.array[i3 + 1] - adjLpy
          const distSq = dx * dx + dy * dy
          if (distSq < radiusSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq)
            const strength = (1 - dist / radius) * explodeForce * (1 - releaseElapsed / 0.3)
            velocities[i3] += (dx / dist) * strength
            velocities[i3 + 1] += (dy / dist) * strength
          }
        }
      } else {
        longPressRef.current = {
          active: false, x: 0, y: 0,
          startTime: 0, released: false, releaseTime: 0, holdDuration: 0,
        }
      }
    }

    posAttr.needsUpdate = true

    // ===== Per-particle fade for milkyway waterfall =====
    const fadeAttr = geometry.attributes.fade as THREE.BufferAttribute
    const currentFormName = FORMATION_NAMES[formation.currentIndex]
    if (!isMorphing.current && currentFormName === 'milkyway') {
      // Sky particles (high Y) stay fully visible
      // Falling particles fade out as they descend
      const fadeStart = -0.5
      const fadeEnd = -2.2
      const fadeRange = fadeStart - fadeEnd
      for (let i = 0; i < TOTAL_COUNT; i++) {
        const py = posAttr.array[i * 3 + 1]
        if (py >= fadeStart) {
          particleFades[i] = 1.0
        } else if (py <= fadeEnd) {
          particleFades[i] = 0.0
        } else {
          // Quadratic fade: slow start, fast end — particles linger then vanish
          const linear = (py - fadeEnd) / fadeRange
          particleFades[i] = linear * linear
        }
      }
      fadeAttr.needsUpdate = true
    } else if (isMorphing.current) {
      // During morph: lerp all fades toward 1.0
      let needsFadeUpdate = false
      for (let i = 0; i < TOTAL_COUNT; i++) {
        if (particleFades[i] < 1.0) {
          particleFades[i] = Math.min(1.0, particleFades[i] + delta * 2.0)
          needsFadeUpdate = true
        }
      }
      if (needsFadeUpdate) fadeAttr.needsUpdate = true
    }

    // ===== Auto-cycle timer =====
    if (!formation.paused && !isMorphing.current) {
      autoTimerRef.current += delta
      if (autoTimerRef.current >= AUTO_CYCLE_INTERVAL) {
        autoTimerRef.current = 0
        nextFormation()
      }
    }

    // ===== Dynamic Light Chain =====

    // Interpolate chain config between previous and target formations
    const morphT = smootherstep(isMorphing.current ? Math.min(1, morphTimeRef.current / morphDuration) : 1)
    const prevCC = prevChainConfigRef.current
    const targCC = targetChainConfigRef.current
    const lerpV = (a: number, b: number) => a + (b - a) * morphT
    const effectiveCurvature = lerpV(prevCC.curvatureBias, targCC.curvatureBias)
    const effectiveSpeedScale = lerpV(prevCC.speedScale, targCC.speedScale)
    const effectiveMaxLength = Math.round(lerpV(prevCC.maxLength, targCC.maxLength))

    // Shorten chain during living motion — particles drift, old nodes go stale fast
    const chainFormName = FORMATION_NAMES[formation.currentIndex]
    const chainIsLiving = !isMorphing.current && !!LIVING_MOTION[chainFormName]
    const activeMaxLength = chainIsLiving ? Math.max(5, Math.round(effectiveMaxLength * 0.45)) : effectiveMaxLength

    // Chase weight: smoothstep of mouse speed, exponentially smoothed
    const rawChase = smoothstepRange(mouse.speed, 1, 8)
    chaseWeightRef.current += (rawChase - chaseWeightRef.current) * delta * 3.0
    const cw = chaseWeightRef.current

    const headPos = headPosRef.current
    const headDir = headDirRef.current
    const chain = chainRef.current

    // Update smoothed positions for chain nodes (low-pass filter for stable rendering)
    const smoothed = chainSmoothedPositionsRef.current
    const prevChain = prevChainRef.current
    for (let ci = 0; ci < chain.length; ci++) {
      const idx = chain[ci]
      const ax = posAttr.array[idx * 3] as number
      const ay = posAttr.array[idx * 3 + 1] as number
      const az = posAttr.array[idx * 3 + 2] as number
      if (ci >= prevChain.length || chain[ci] !== prevChain[ci]) {
        // New node or index changed — initialize to actual position
        smoothed[ci * 3] = ax
        smoothed[ci * 3 + 1] = ay
        smoothed[ci * 3 + 2] = az
      } else {
        smoothed[ci * 3] += (ax - smoothed[ci * 3]) * CHAIN_SMOOTH_FACTOR
        smoothed[ci * 3 + 1] += (ay - smoothed[ci * 3 + 1]) * CHAIN_SMOOTH_FACTOR
        smoothed[ci * 3 + 2] += (az - smoothed[ci * 3 + 2]) * CHAIN_SMOOTH_FACTOR
      }
    }
    prevChainRef.current = chain.slice()

    // Compute average z of chain particles for perspective-corrected chase
    let chainAvgZ = 0
    if (chain.length > 0) {
      for (let ci = 0; ci < chain.length; ci++) {
        chainAvgZ += smoothed[ci * 3 + 2]
      }
      chainAvgZ /= chain.length
    }
    const chainZScale = Math.max(MIN_Z_DIST, CAMERA_Z - chainAvgZ) / CAMERA_Z

    // Chase direction toward mouse (perspective-corrected to particle z-plane)
    const chaseTargetX = mouseWorldX * chainZScale
    const chaseTargetY = mouseWorldY * chainZScale
    const chaseDx = chaseTargetX - headPos.x
    const chaseDy = chaseTargetY - headPos.y
    const chaseDist = Math.sqrt(chaseDx * chaseDx + chaseDy * chaseDy)
    let chaseNx = 0, chaseNy = 0
    if (chaseDist > 0.001) {
      chaseNx = chaseDx / chaseDist
      chaseNy = chaseDy / chaseDist
    }

    // Roaming: spiral component — rotate current direction by noise-driven curvature
    const curvature = curvatureNoise(time) * 2.0 * (0.5 + effectiveCurvature * 1.5)
    spiralAngleRef.current += curvature * delta
    const rotAngle = curvature * delta
    const cosR = Math.cos(rotAngle)
    const sinR = Math.sin(rotAngle)
    const spiralDx = headDir.x * cosR - headDir.y * sinR
    const spiralDy = headDir.x * sinR + headDir.y * cosR

    // Roaming: explorer component — repulsion from nearest chain nodes
    let explorerDx = 0, explorerDy = 0
    const nodesToCheck = Math.min(5, chain.length)
    for (let ci = chain.length - 1; ci >= Math.max(0, chain.length - nodesToCheck); ci--) {
      const rdx = headPos.x - smoothed[ci * 3]
      const rdy = headPos.y - smoothed[ci * 3 + 1]
      const rdistSq = rdx * rdx + rdy * rdy
      if (rdistSq > 0.0001) {
        const rdist = Math.sqrt(rdistSq)
        explorerDx += (rdx / rdist) / rdistSq
        explorerDy += (rdy / rdist) / rdistSq
      }
    }
    const explorerLen = Math.sqrt(explorerDx * explorerDx + explorerDy * explorerDy)
    if (explorerLen > 0.001) {
      explorerDx /= explorerLen
      explorerDy /= explorerLen
    }

    // Blend spiral (0.7) + explorer (0.3) into roam direction
    let roamDx = spiralDx * 0.7 + explorerDx * 0.3
    let roamDy = spiralDy * 0.7 + explorerDy * 0.3
    const roamLen = Math.sqrt(roamDx * roamDx + roamDy * roamDy)
    if (roamLen > 0.001) {
      roamDx /= roamLen
      roamDy /= roamLen
    }

    // Blend roam and chase using chase weight
    let finalDx = roamDx * (1 - cw) + chaseNx * cw
    let finalDy = roamDy * (1 - cw) + chaseNy * cw
    const finalLen = Math.sqrt(finalDx * finalDx + finalDy * finalDy)
    if (finalLen > 0.001) {
      finalDx /= finalLen
      finalDy /= finalLen
    }

    // Direction inertia: smooth transition between frames
    let newDirX = headDir.x * 0.85 + finalDx * 0.15
    let newDirY = headDir.y * 0.85 + finalDy * 0.15
    const newDirLen = Math.sqrt(newDirX * newDirX + newDirY * newDirY)
    if (newDirLen > 0.001) {
      newDirX /= newDirLen
      newDirY /= newDirLen
    }
    headDir.x = newDirX
    headDir.y = newDirY

    // Speed: faster when chasing, slower when roaming, scaled per formation
    const headSpeed = (0.8 + 1.7 * cw) * effectiveSpeedScale * (1 + Math.sin(time * 1.7) * 0.2)

    // Move head
    headPos.x += headDir.x * headSpeed * delta
    headPos.y += headDir.y * headSpeed * delta

    // Soft boundary containment
    const halfW = viewport.width * 0.5
    const halfH = viewport.height * 0.5
    if (Math.abs(headPos.x) > halfW * 0.9) {
      const overshoot = (Math.abs(headPos.x) - halfW * 0.9) / (halfW * 0.1)
      headDir.x -= Math.sign(headPos.x) * Math.min(overshoot, 1) * delta * 5
    }
    if (Math.abs(headPos.y) > halfH * 0.9) {
      const overshoot = (Math.abs(headPos.y) - halfH * 0.9) / (halfH * 0.1)
      headDir.y -= Math.sign(headPos.y) * Math.min(overshoot, 1) * delta * 5
    }
    const bLen = Math.sqrt(headDir.x * headDir.x + headDir.y * headDir.y)
    if (bLen > 0.001) {
      headDir.x /= bLen
      headDir.y /= bLen
    }

    // Particle snap-on collection: scan random subset for nearby particles
    // Project head position to each particle's z-plane for screen-space proximity
    const baseSnapRadius = 0.25
    // Ensure chain member flags are set (may already be set from main loop, but needed during morphing too)
    for (let ci = 0; ci < chain.length; ci++) {
      chainMemberFlags[chain[ci]] = 1
    }
    let bestSnapIdx = -1
    let bestSnapDistSq = Infinity
    const scanSeed = Math.floor(time * 1000)
    for (let s = 0; s < 200; s++) {
      const idx = Math.floor(seededRand(scanSeed + s * 37) * TOTAL_COUNT)
      if (chainMemberFlags[idx]) continue
      const pz = posAttr.array[idx * 3 + 2]
      const snapZScale = Math.max(MIN_Z_DIST, CAMERA_Z - pz) / CAMERA_Z
      const adjHeadX = headPos.x * snapZScale
      const adjHeadY = headPos.y * snapZScale
      const snapRadius = baseSnapRadius * snapZScale
      const snapRadiusSq = snapRadius * snapRadius
      const pdx = posAttr.array[idx * 3] - adjHeadX
      const pdy = posAttr.array[idx * 3 + 1] - adjHeadY
      const pdistSq = pdx * pdx + pdy * pdy
      if (pdistSq < snapRadiusSq && pdistSq < bestSnapDistSq) {
        bestSnapIdx = idx
        bestSnapDistSq = pdistSq
      }
    }
    // Clear chain member flags
    for (let ci = 0; ci < chain.length; ci++) {
      chainMemberFlags[chain[ci]] = 0
    }
    if (bestSnapIdx !== -1) {
      chain.push(bestSnapIdx)
      while (chain.length > activeMaxLength) {
        chain.shift()
      }
    }

    // Update line geometry with per-formation chase-weight-driven visuals
    const lineGeo = lineRef.current?.geometry
    if (lineGeo && chain.length >= 1) {
      const linePosAttr = lineGeo.attributes.position as THREE.BufferAttribute
      const lineOpAttr = lineGeo.attributes.opacity as THREE.BufferAttribute
      const lineColAttr = lineGeo.attributes.lineColor as THREE.BufferAttribute
      const totalPoints = chain.length
      let pointCount = 0

      // Interpolate chain colors between previous and target formation configs
      const roamTail = [
        lerpV(prevCC.roamColor.tail[0], targCC.roamColor.tail[0]),
        lerpV(prevCC.roamColor.tail[1], targCC.roamColor.tail[1]),
        lerpV(prevCC.roamColor.tail[2], targCC.roamColor.tail[2]),
      ]
      const roamHead = [
        lerpV(prevCC.roamColor.head[0], targCC.roamColor.head[0]),
        lerpV(prevCC.roamColor.head[1], targCC.roamColor.head[1]),
        lerpV(prevCC.roamColor.head[2], targCC.roamColor.head[2]),
      ]
      const chaseTail = [
        lerpV(prevCC.chaseColor.tail[0], targCC.chaseColor.tail[0]),
        lerpV(prevCC.chaseColor.tail[1], targCC.chaseColor.tail[1]),
        lerpV(prevCC.chaseColor.tail[2], targCC.chaseColor.tail[2]),
      ]
      const chaseHead = [
        lerpV(prevCC.chaseColor.head[0], targCC.chaseColor.head[0]),
        lerpV(prevCC.chaseColor.head[1], targCC.chaseColor.head[1]),
        lerpV(prevCC.chaseColor.head[2], targCC.chaseColor.head[2]),
      ]

      for (let ci = 0; ci < totalPoints; ci++) {
        linePosAttr.setXYZ(pointCount, smoothed[ci * 3], smoothed[ci * 3 + 1], smoothed[ci * 3 + 2])
        const ct = ci / Math.max(1, totalPoints)
        const fade = ct * ct

        // Opacity: higher when chasing, softer when roaming, reduced during living motion
        const livingFade = chainIsLiving ? 0.65 : 1.0
        lineOpAttr.setX(pointCount, fade * (0.3 + cw * 0.4) * livingFade)

        // Per-formation color gradient: blend roam/chase by chaseWeight, tail/head by ct
        const r = (roamTail[0] + (roamHead[0] - roamTail[0]) * ct) * (1 - cw) + (chaseTail[0] + (chaseHead[0] - chaseTail[0]) * ct) * cw
        const g = (roamTail[1] + (roamHead[1] - roamTail[1]) * ct) * (1 - cw) + (chaseTail[1] + (chaseHead[1] - chaseTail[1]) * ct) * cw
        const b = (roamTail[2] + (roamHead[2] - roamTail[2]) * ct) * (1 - cw) + (chaseTail[2] + (chaseHead[2] - chaseTail[2]) * ct) * cw
        lineColAttr.setXYZ(pointCount, r, g, b)
        pointCount++
      }

      // Free-floating head point — use head colors
      linePosAttr.setXYZ(pointCount, headPos.x, headPos.y, 0)
      lineOpAttr.setX(pointCount, 0.5 + cw * 0.5)
      const hr = roamHead[0] * (1 - cw) + chaseHead[0] * cw
      const hg = roamHead[1] * (1 - cw) + chaseHead[1] * cw
      const hb = roamHead[2] * (1 - cw) + chaseHead[2] * cw
      lineColAttr.setXYZ(pointCount, hr, hg, hb)
      pointCount++

      lineGeo.setDrawRange(0, pointCount)
      linePosAttr.needsUpdate = true
      lineOpAttr.needsUpdate = true
      lineColAttr.needsUpdate = true
    } else if (lineGeo) {
      lineGeo.setDrawRange(0, 0)
    }
  })

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={TOTAL_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={TOTAL_COUNT}
            array={sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-phase"
            count={TOTAL_COUNT}
            array={phases}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-fade"
            count={TOTAL_COUNT}
            array={particleFades}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={shaderUniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </points>

      <threeLine ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={MAX_CHAIN_LENGTH_UPPER + 1}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-opacity"
            count={MAX_CHAIN_LENGTH_UPPER + 1}
            array={lineOpacities}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-lineColor"
            count={MAX_CHAIN_LENGTH_UPPER + 1}
            array={lineColors}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={lineVertexShader}
          fragmentShader={lineFragmentShader}
        />
      </threeLine>
    </>
  )
}
