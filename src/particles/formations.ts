import type { FormationName, ChainFormationConfig } from '../types'

export type FormationGenerator = (
  index: number,
  total: number,
  time?: number,
) => { x: number; y: number; z: number }

// Seeded random for deterministic formations
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

// ==================== Diffuse ====================
// Random positions in a 6x2x2 field
const diffuse: FormationGenerator = (index) => {
  return {
    x: (seededRandom(index * 3 + 0) - 0.5) * 6,
    y: (seededRandom(index * 3 + 1) - 0.5) * 2,
    z: (seededRandom(index * 3 + 2) - 0.5) * 2,
  }
}

// ==================== Lorenz Attractor ====================
// Pre-compute trajectory then distribute particles along it
function computeLorenzTrajectory(steps: number): Array<{ x: number; y: number; z: number }> {
  const sigma = 10
  const rho = 28
  const beta = 8 / 3
  const dt = 0.005
  const points: Array<{ x: number; y: number; z: number }> = []

  let x = 0.1, y = 0, z = 0

  // Warm up
  for (let i = 0; i < 500; i++) {
    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z
    x += dx * dt
    y += dy * dt
    z += dz * dt
  }

  for (let i = 0; i < steps; i++) {
    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z
    x += dx * dt
    y += dy * dt
    z += dz * dt
    points.push({ x, y, z })
  }

  return points
}

let lorenzCache: Array<{ x: number; y: number; z: number }> | null = null

const lorenz: FormationGenerator = (index, total) => {
  if (!lorenzCache || lorenzCache.length < total) {
    lorenzCache = computeLorenzTrajectory(total)
  }
  const p = lorenzCache[index]
  // Scale to fit viewport: Lorenz range is roughly x:[-20,20], y:[-25,25], z:[0,50]
  const scale = 0.06
  return {
    x: p.x * scale,
    y: (p.z - 25) * scale, // center vertically
    z: p.y * scale * 0.3,  // use y as depth, compressed
  }
}

// ==================== Double Helix ====================
// DNA-like intertwined dual spiral tubes with strong vertical 3D
const helix: FormationGenerator = (index, total, time) => {
  const turns = 4
  const R = 0.6
  const height = 2.4
  const tubeR = 0.08

  const strand = index % 2
  const idx = Math.floor(index / 2)
  const halfTotal = Math.floor(total / 2)

  const t = (idx / halfTotal) * Math.PI * 2 * turns
  const phase = strand * Math.PI

  // Living motion: slow rotation around Y axis
  const rotY = time !== undefined ? time * (Math.PI * 2) / 50 : 0

  const s = seededRandom(index * 41 + 17) * Math.PI * 2
  let cx = R * Math.cos(t + phase) + tubeR * Math.cos(s)
  const cy = (idx / halfTotal - 0.5) * height
  let cz = R * Math.sin(t + phase) + tubeR * Math.sin(s)

  if (rotY !== 0) {
    const cosR = Math.cos(rotY)
    const sinR = Math.sin(rotY)
    const rx = cx * cosR + cz * sinR
    const rz = -cx * sinR + cz * cosR
    cx = rx
    cz = rz
  }

  return { x: cx, y: cy, z: cz * 0.6 }
}

// ==================== Möbius Strip ====================
// Non-orientable surface with half-twist, slow rotation
const mobius: FormationGenerator = (index, total, time) => {
  const R = 1.2
  const w = 0.35

  const u = (index / total) * Math.PI * 2
  const v = (seededRandom(index * 53 + 21) - 0.5) * 2 * w

  const rotY = time !== undefined ? time * (Math.PI * 2) / 70 : 0

  let x = (R + v * Math.cos(u / 2)) * Math.cos(u)
  const y = v * Math.sin(u / 2)
  let z = (R + v * Math.cos(u / 2)) * Math.sin(u)

  if (rotY !== 0) {
    const cosR = Math.cos(rotY)
    const sinR = Math.sin(rotY)
    const rx = x * cosR + z * sinR
    const rz = -x * sinR + z * cosR
    x = rx
    z = rz
  }

  return { x: x * 0.65, y: y * 0.65, z: z * 0.5 }
}

// ==================== Torus ====================
// Uniform sampling on torus surface
const torus: FormationGenerator = (index, total) => {
  // Use golden ratio-based sampling for even distribution
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const theta = (2 * Math.PI * index) / goldenRatio // around the tube
  const phi = (2 * Math.PI * index) / total * goldenRatio * total // around the ring

  const R = 1.2  // major radius
  const r = 0.45 // minor radius

  return {
    x: (R + r * Math.cos(theta)) * Math.cos(phi),
    y: (R + r * Math.cos(theta)) * Math.sin(phi) * 0.7, // compress Y slightly
    z: r * Math.sin(theta) * 0.6,
  }
}

// ==================== Rose Curve (Rhodonea) ====================
// r = cos(k * theta), with perpendicular spread for visual thickness
const rhodonea: FormationGenerator = (index, total, time) => {
  const k = time !== undefined
    ? 5 / 3 + Math.sin(time * 0.12) * 0.15 // gentle drift around 5/3, range ~1.52-1.82
    : 5 / 3

  const theta = (index / total) * Math.PI * 2 * 6 // 6 loops for full coverage
  const r = Math.cos(k * theta) * 1.8

  // Perpendicular offset for thickness
  const spread = (seededRandom(index * 19 + 11) - 0.5) * 0.08
  const nx = -Math.sin(theta)
  const ny = Math.cos(theta)

  return {
    x: r * Math.cos(theta) + nx * spread,
    y: r * Math.sin(theta) + ny * spread,
    z: (seededRandom(index * 23 + 7) - 0.5) * 0.25,
  }
}

// ==================== Trefoil Knot ====================
// (2,3)-torus knot with tube surface sampling
const trefoil: FormationGenerator = (index, total, time) => {
  const tubeR = time !== undefined
    ? 0.15 + Math.sin(time * 0.6) * 0.03 // gentle pulsation between 0.12 and 0.18
    : 0.15

  const rotY = time !== undefined
    ? time * (Math.PI * 2) / 80 // ~1 rotation per 80s
    : 0

  // Parameter along knot curve
  const t = (index / total) * Math.PI * 2

  // Trefoil knot parametric curve
  const kx = Math.sin(t) + 2 * Math.sin(2 * t)
  const ky = Math.cos(t) - 2 * Math.cos(2 * t)
  const kz = -Math.sin(3 * t)

  // Tangent vector (derivative)
  const dtx = Math.cos(t) + 4 * Math.cos(2 * t)
  const dty = -Math.sin(t) + 4 * Math.sin(2 * t)
  const dtz = -3 * Math.cos(3 * t)
  const tLen = Math.sqrt(dtx * dtx + dty * dty + dtz * dtz)
  const tNx = dtx / tLen, tNy = dty / tLen, tNz = dtz / tLen

  // Normal via cross product with a reference vector
  let nrx = -tNy, nry = tNx, nrz = 0
  const nrLen = Math.sqrt(nrx * nrx + nry * nry + nrz * nrz)
  if (nrLen > 0.001) {
    nrx /= nrLen; nry /= nrLen; nrz /= nrLen
  } else {
    nrx = 1; nry = 0; nrz = 0
  }
  // Binormal = tangent x normal
  const bx = tNy * nrz - tNz * nry
  const by = tNz * nrx - tNx * nrz
  const bz = tNx * nry - tNy * nrx

  // Tube angle from seeded random
  const s = seededRandom(index * 31 + 17) * Math.PI * 2
  const cosS = Math.cos(s)
  const sinS = Math.sin(s)

  const scale = 0.4

  let px = (kx + tubeR * (cosS * nrx + sinS * bx)) * scale
  const py = (ky + tubeR * (cosS * nry + sinS * by)) * scale
  let pz = (kz + tubeR * (cosS * nrz + sinS * bz)) * scale

  // Apply Y-axis rotation for living motion
  if (rotY !== 0) {
    const cosR = Math.cos(rotY)
    const sinR = Math.sin(rotY)
    const rx = px * cosR + pz * sinR
    const rz = -px * sinR + pz * cosR
    px = rx
    pz = rz
  }

  return { x: px, y: py, z: pz }
}

// ==================== Clifford Attractor ====================
// Iterated map: x' = sin(a*y) + c*cos(a*x), y' = sin(b*x) + d*cos(b*y)
function computeCliffordTrajectory(
  steps: number,
  a: number, b: number, c: number, d: number,
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = []
  let x = 0.1, y = 0.1

  // Warm up
  for (let i = 0; i < 200; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x)
    const ny = Math.sin(b * x) + d * Math.cos(b * y)
    x = nx; y = ny
  }

  for (let i = 0; i < steps; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x)
    const ny = Math.sin(b * x) + d * Math.cos(b * y)
    x = nx; y = ny
    points.push({ x, y })
  }
  return points
}

let cliffordCache: { points: Array<{ x: number; y: number }>; key: string } | null = null

const clifford: FormationGenerator = (index, total, time) => {
  const a = time !== undefined ? -1.4 + Math.sin(time * 0.03) * 0.05 : -1.4
  const b = time !== undefined ? 1.6 + Math.sin(time * 0.025) * 0.04 : 1.6
  const c = time !== undefined ? 1.0 + Math.sin(time * 0.02) * 0.03 : 1.0
  const d = time !== undefined ? 0.7 + Math.sin(time * 0.035) * 0.04 : 0.7

  const key = `${a.toFixed(4)}_${b.toFixed(4)}_${c.toFixed(4)}_${d.toFixed(4)}`

  if (!cliffordCache || cliffordCache.key !== key || cliffordCache.points.length < total) {
    cliffordCache = { points: computeCliffordTrajectory(total, a, b, c, d), key }
  }

  const p = cliffordCache.points[index]
  const scale = 0.65

  return {
    x: p.x * scale,
    y: p.y * scale,
    z: Math.sin((index / total) * Math.PI * 4) * 0.25,
  }
}

// ==================== Aizawa Attractor ====================
// Twisted torus-shaped chaotic attractor with strong 3D depth
// dx/dt = (z-b)x - dy, dy/dt = dx + (z-b)y, dz/dt = c + az - z³/3 - (x²+y²)(1+ez) + fzx³
function computeAizawaTrajectory(
  steps: number,
  a: number, b: number, c: number, d: number, e: number, f: number,
): Array<{ x: number; y: number; z: number }> {
  const dt = 0.005
  const subSteps = 3
  const points: Array<{ x: number; y: number; z: number }> = []
  let x = 0.1, y = 0, z = 0

  for (let i = 0; i < 1000; i++) {
    const dx = (z - b) * x - d * y
    const dy = d * x + (z - b) * y
    const dz = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x
    x += dx * dt; y += dy * dt; z += dz * dt
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < subSteps; j++) {
      const dx = (z - b) * x - d * y
      const dy = d * x + (z - b) * y
      const dz = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x
      x += dx * dt; y += dy * dt; z += dz * dt
    }
    points.push({ x, y, z })
  }

  return points
}

let aizawaCache: { points: Array<{ x: number; y: number; z: number }>; key: string } | null = null

const aizawa: FormationGenerator = (index, total, time) => {
  const a = time !== undefined ? 0.95 + Math.sin(time * 0.03) * 0.02 : 0.95
  const d = time !== undefined ? 3.5 + Math.sin(time * 0.025) * 0.05 : 3.5

  const key = `${a.toFixed(4)}_${d.toFixed(4)}`

  if (!aizawaCache || aizawaCache.key !== key || aizawaCache.points.length < total) {
    aizawaCache = { points: computeAizawaTrajectory(total, a, 0.7, 0.6, d, 0.25, 0.1), key }
  }

  const p = aizawaCache.points[index]
  return {
    x: p.x * 0.7,
    y: (p.z - 0.6) * 0.55,
    z: p.y * 0.5,
  }
}

// ==================== Spherical Harmonics ====================
// Fibonacci sphere sampling with radius modulated by Y_3^2 / Y_4^3 harmonic blend
const harmonics: FormationGenerator = (index, total, time) => {
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const theta = Math.acos(1 - 2 * (index + 0.5) / total)
  const phi = 2 * Math.PI * index / goldenRatio

  // Living motion: smoothly blend between two harmonic shapes
  const blend = time !== undefined ? 0.5 + Math.sin(time * 0.08) * 0.4 : 0.5

  const sinT = Math.sin(theta)
  const cosT = Math.cos(theta)

  // Y_3^2: clover-like 6 lobes (3 above + 3 below equator)
  const y32 = sinT * sinT * cosT * Math.cos(2 * phi)
  // Y_4^3: complex asymmetric 3D lobes
  const y43 = sinT * sinT * sinT * cosT * Math.sin(3 * phi)

  const harmonic = y32 * (1 - blend) + y43 * blend
  const r = (0.5 + 2.5 * Math.pow(Math.abs(harmonic) + 0.01, 0.7)) * 0.9

  return {
    x: r * sinT * Math.cos(phi),
    y: r * cosT,
    z: r * sinT * Math.sin(phi) * 0.7,
  }
}

// ==================== Thomas Attractor ====================
// Cyclically symmetric 3D attractor: dx/dt = sin(y) - bx, dy/dt = sin(z) - by, dz/dt = sin(x) - bz
function computeThomasTrajectory(
  steps: number, b: number,
): Array<{ x: number; y: number; z: number }> {
  const dt = 0.02
  const subSteps = 4
  const points: Array<{ x: number; y: number; z: number }> = []
  let x = 1.0, y = 1.1, z = -0.01

  for (let i = 0; i < 1000; i++) {
    const dx = Math.sin(y) - b * x
    const dy = Math.sin(z) - b * y
    const dz = Math.sin(x) - b * z
    x += dx * dt; y += dy * dt; z += dz * dt
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < subSteps; j++) {
      const dx = Math.sin(y) - b * x
      const dy = Math.sin(z) - b * y
      const dz = Math.sin(x) - b * z
      x += dx * dt; y += dy * dt; z += dz * dt
    }
    points.push({ x, y, z })
  }

  return points
}

let thomasCache: { points: Array<{ x: number; y: number; z: number }>; key: string } | null = null

const thomas: FormationGenerator = (index, total, time) => {
  const b = time !== undefined ? 0.208186 + Math.sin(time * 0.04) * 0.005 : 0.208186

  const key = b.toFixed(6)

  if (!thomasCache || thomasCache.key !== key || thomasCache.points.length < total) {
    thomasCache = { points: computeThomasTrajectory(total, b), key }
  }

  const p = thomasCache.points[index]
  const scale = 0.35

  return {
    x: p.x * scale,
    y: p.y * scale,
    z: p.z * scale * 0.7,
  }
}

// ==================== Shell Spiral (Nautilus) ====================
// Logarithmic spiral tube — organic seashell surface with exponential growth
const shell: FormationGenerator = (index, total, time) => {
  const turns = 3.5
  const growthRate = 0.12
  const t = (index / total) * Math.PI * 2 * turns
  const u = seededRandom(index * 47 + 13) * Math.PI * 2

  const r = 0.08 * Math.exp(growthRate * t)
  const tubeR = r * 0.22

  const rotY = time !== undefined ? time * (Math.PI * 2) / 60 : 0

  let x = (r + tubeR * Math.cos(u)) * Math.cos(t)
  let z = (r + tubeR * Math.cos(u)) * Math.sin(t)
  const y = t * 0.035 + tubeR * Math.sin(u) * 0.4

  const yCenter = turns * Math.PI * 0.035

  if (rotY !== 0) {
    const cosR = Math.cos(rotY)
    const sinR = Math.sin(rotY)
    const rx = x * cosR + z * sinR
    const rz = -x * sinR + z * cosR
    x = rx
    z = rz
  }

  return { x: x * 0.5, y: (y - yCenter) * 0.5, z: z * 0.35 }
}

// ==================== Rössler Attractor ====================
// Single-scroll attractor: dx/dt=-y-z, dy/dt=x+ay, dz/dt=b+z(x-c)
function computeRosslerTrajectory(
  steps: number, a: number, b: number, c: number,
): Array<{ x: number; y: number; z: number }> {
  const dt = 0.01
  const subSteps = 3
  const points: Array<{ x: number; y: number; z: number }> = []
  let x = 1.0, y = 0, z = 0

  for (let i = 0; i < 2000; i++) {
    const dx = -y - z
    const dy = x + a * y
    const dz = b + z * (x - c)
    x += dx * dt; y += dy * dt; z += dz * dt
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < subSteps; j++) {
      const dx = -y - z
      const dy = x + a * y
      const dz = b + z * (x - c)
      x += dx * dt; y += dy * dt; z += dz * dt
    }
    points.push({ x, y, z })
  }

  return points
}

let rosslerCache: { points: Array<{ x: number; y: number; z: number }>; key: string } | null = null

const rossler: FormationGenerator = (index, total, time) => {
  const a = time !== undefined ? 0.2 + Math.sin(time * 0.03) * 0.015 : 0.2

  const key = a.toFixed(4)

  if (!rosslerCache || rosslerCache.key !== key || rosslerCache.points.length < total) {
    rosslerCache = { points: computeRosslerTrajectory(total, a, 0.2, 5.7), key }
  }

  const p = rosslerCache.points[index]
  return {
    x: p.x * 0.1,
    y: p.y * 0.1,
    z: Math.min(p.z, 10) * 0.05,
  }
}

// ==================== Klein Bottle ====================
// Figure-8 immersion of the Klein bottle — non-orientable 3D surface
const klein: FormationGenerator = (index, total, time) => {
  const v = (index / total) * Math.PI * 2
  const u = seededRandom(index * 59 + 7) * Math.PI * 2

  const rotY = time !== undefined ? time * (Math.PI * 2) / 70 : 0

  const cosHalfV = Math.cos(v / 2)
  const sinHalfV = Math.sin(v / 2)
  const sinU = Math.sin(u)
  const sin2U = Math.sin(2 * u)
  const cosV = Math.cos(v)
  const sinV = Math.sin(v)

  const a = 2
  const profile = a + cosHalfV * sinU - sinHalfV * sin2U

  let x = profile * cosV
  let z = profile * sinV
  const y = sinHalfV * sinU + cosHalfV * sin2U

  const scale = 0.35

  if (rotY !== 0) {
    const cosR = Math.cos(rotY)
    const sinR = Math.sin(rotY)
    const rx = x * cosR + z * sinR
    const rz = -x * sinR + z * cosR
    x = rx
    z = rz
  }

  return { x: x * scale, y: y * scale, z: z * scale * 0.6 }
}

// ==================== Cinquefoil Knot (2,5 Torus Knot) ====================
// Five-lobed star knot with tube surface sampling
const cinquefoil: FormationGenerator = (index, total, time) => {
  const tubeR = time !== undefined
    ? 0.12 + Math.sin(time * 0.5) * 0.02
    : 0.12

  const rotY = time !== undefined ? time * (Math.PI * 2) / 90 : 0

  const t = (index / total) * Math.PI * 2
  const p = 2, q = 5

  // Torus knot curve
  const kx = Math.cos(p * t) * (2 + Math.cos(q * t))
  const ky = Math.sin(p * t) * (2 + Math.cos(q * t))
  const kz = -Math.sin(q * t)

  // Tangent vector
  const dtx = -p * Math.sin(p * t) * (2 + Math.cos(q * t)) - Math.cos(p * t) * q * Math.sin(q * t)
  const dty = p * Math.cos(p * t) * (2 + Math.cos(q * t)) - Math.sin(p * t) * q * Math.sin(q * t)
  const dtz = -q * Math.cos(q * t)
  const tLen = Math.sqrt(dtx * dtx + dty * dty + dtz * dtz)
  const tNx = dtx / tLen, tNy = dty / tLen, tNz = dtz / tLen

  // Normal via cross with reference
  let nrx = -tNy, nry = tNx, nrz = 0
  const nrLen = Math.sqrt(nrx * nrx + nry * nry + nrz * nrz)
  if (nrLen > 0.001) {
    nrx /= nrLen; nry /= nrLen; nrz /= nrLen
  } else {
    nrx = 1; nry = 0; nrz = 0
  }
  const bx = tNy * nrz - tNz * nry
  const by = tNz * nrx - tNx * nrz
  const bz = tNx * nry - tNy * nrx

  const s = seededRandom(index * 37 + 23) * Math.PI * 2
  const cosS = Math.cos(s), sinS = Math.sin(s)

  const scale = 0.3

  let px = (kx + tubeR * (cosS * nrx + sinS * bx)) * scale
  const py = (ky + tubeR * (cosS * nry + sinS * by)) * scale
  let pz = (kz + tubeR * (cosS * nrz + sinS * bz)) * scale

  if (rotY !== 0) {
    const cosR = Math.cos(rotY)
    const sinR = Math.sin(rotY)
    const rx = px * cosR + pz * sinR
    const rz = -px * sinR + pz * cosR
    px = rx
    pz = rz
  }

  return { x: px, y: py, z: pz }
}

// ==================== Halvorsen Attractor ====================
// Three-fold symmetric: dx=-ax-4y-4z-y², dy=-ay-4z-4x-z², dz=-az-4x-4y-x²
function computeHalvorsenTrajectory(
  steps: number, a: number,
): Array<{ x: number; y: number; z: number }> {
  const dt = 0.005
  const subSteps = 3
  const points: Array<{ x: number; y: number; z: number }> = []
  let x = -1.48, y = -1.51, z = 2.04

  for (let i = 0; i < 1500; i++) {
    const dx = -a * x - 4 * y - 4 * z - y * y
    const dy = -a * y - 4 * z - 4 * x - z * z
    const dz = -a * z - 4 * x - 4 * y - x * x
    x += dx * dt; y += dy * dt; z += dz * dt
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < subSteps; j++) {
      const dx = -a * x - 4 * y - 4 * z - y * y
      const dy = -a * y - 4 * z - 4 * x - z * z
      const dz = -a * z - 4 * x - 4 * y - x * x
      x += dx * dt; y += dy * dt; z += dz * dt
    }
    points.push({ x, y, z })
  }

  return points
}

let halvorsenCache: { points: Array<{ x: number; y: number; z: number }>; key: string } | null = null

const halvorsen: FormationGenerator = (index, total, time) => {
  const a = time !== undefined ? 1.89 + Math.sin(time * 0.035) * 0.03 : 1.89

  const key = a.toFixed(4)

  if (!halvorsenCache || halvorsenCache.key !== key || halvorsenCache.points.length < total) {
    halvorsenCache = { points: computeHalvorsenTrajectory(total, a), key }
  }

  const p = halvorsenCache.points[index]
  const scale = 0.25

  return {
    x: p.x * scale,
    y: p.y * scale,
    z: p.z * scale * 0.7,
  }
}

// ==================== Milkyway Cascade ====================
// Grand cosmic milky way: ~70% particles form a permanent, stunning galactic arc across the sky.
// ~30% particles continuously peel off from one end and cascade downward, fading into the void.
// Falling particles recycle invisibly (teleport back when faded out) so the stream never stops.
const milkyway: FormationGenerator = (index, total, time) => {
  const t0 = time !== undefined ? time : 0

  // Seeded randoms
  const lateralSeed = seededRandom(index * 61 + 29)
  const lateral = (lateralSeed - 0.5) * 2
  const depthSeed = seededRandom(index * 43 + 17)
  const turbSeed = seededRandom(index * 73 + 41)
  const turbPhase = turbSeed * 6.2831
  const clusterSeed = seededRandom(index * 37 + 59)

  // Split: 70% permanent sky, 30% falling stream
  const skyCount = Math.floor(total * 0.70)

  if (index < skyCount) {
    // ========= Permanent galactic arc =========
    const skyT = index / skyCount // [0, 1) along the arc

    // Grand elliptical arc parameters
    const Rx = 1.80, Ry = 0.70
    const cx = -0.05, cy = 0.45
    // Sweep ~170° for a majestic arc across the sky
    const angle = Math.PI * 0.92 - skyT * Math.PI * 0.84

    const pathX = cx + Math.cos(angle) * Rx
    const pathY = cy + Math.sin(angle) * Ry

    // Variable width: thick at center (galactic core), thin at edges
    const coreT = Math.sin(skyT * Math.PI) // 0 at edges, 1 at center
    const width = 0.04 + 0.28 * coreT

    // Perpendicular spread direction
    const nx = Math.cos(angle)
    const ny = Math.sin(angle)
    // Center-weighted distribution (denser near spine)
    const lw = lateral * (1.0 - 0.3 * lateral * lateral)

    let x = pathX + nx * lw * width
    let y = pathY + ny * lw * width

    // Volumetric Z depth: thicker at core
    const z = (depthSeed - 0.5) * (0.08 + 0.55 * coreT)

    // Star cluster density bumps — irregular brightness concentrations
    const clusterPhase = Math.sin(skyT * 23.0 + clusterSeed * 17.0) * 0.5 + 0.5
    const clusterPull = clusterPhase * coreT * 0.03
    x += nx * clusterPull * (lateral > 0 ? -1 : 1)
    y += ny * clusterPull * (lateral > 0 ? -1 : 1)

    // Gentle shimmer — slow drift so the galaxy feels alive
    x += Math.sin(t0 * 0.15 + turbPhase) * 0.004
    y += Math.cos(t0 * 0.12 + turbPhase * 1.3) * 0.003
    // Subtle traveling luminance wave
    x += Math.sin(t0 * 0.08 + skyT * 8.0) * 0.002 * coreT

    return { x, y, z }
  } else {
    // ========= Falling stream (continuous infinite cycling) =========
    const fallIndex = index - skyCount
    const fallTotal = total - skyCount

    // Arc endpoint: where the stream detaches from the galaxy
    const detachAngle = Math.PI * 0.92 - Math.PI * 0.84
    const detachX = -0.05 + Math.cos(detachAngle) * 1.80
    const detachY = 0.45 + Math.sin(detachAngle) * 0.70

    // Continuous cycling: each particle has a phase offset, cycles 0→1 forever
    // flowSpeed 0.05 = one full cycle takes ~20s, slow & majestic
    const flowSpeed = 0.05
    const phaseOffset = fallIndex / fallTotal
    const raw = (((phaseOffset + t0 * flowSpeed) % 1.0) + 1.0) % 1.0

    // Start position: at arc edge
    const startX = detachX + lateral * 0.06
    const startY = detachY + (depthSeed - 0.5) * 0.05

    // Fall path: detach → converge → cascade → dissipation
    let x: number, y: number, z: number

    if (raw < 0.15) {
      // === Detach & converge: peel off from arc end ===
      const convT = raw / 0.15
      const eased = convT * convT * (3 - 2 * convT)
      const endX = detachX * 0.6
      const endY = detachY - 0.15

      x = startX + (endX - startX) * eased
      y = startY + (endY - startY) * eased
      z = (depthSeed - 0.5) * (0.15 * (1 - eased) + 0.08 * eased)

    } else if (raw < 0.80) {
      // === Cascade: accelerating waterfall plunge ===
      const cascT = (raw - 0.15) / 0.65
      const cascStartX = detachX * 0.6
      const cascStartY = detachY - 0.15

      const drop = 0.05 * cascT + 0.95 * cascT * cascT * cascT
      x = cascStartX - cascT * 0.30
      y = cascStartY - drop * 2.2

      const width = 0.03 + cascT * 0.10
      x += lateral * width
      z = (depthSeed - 0.5) * (0.08 + cascT * 0.18)

      // Fall turbulence
      const turbAmp = cascT * 0.6
      x += Math.sin(t0 * 1.5 + turbPhase) * 0.010 * turbAmp
      y += Math.cos(t0 * 1.1 + turbPhase * 1.7) * 0.005 * turbAmp

    } else {
      // === Dissipation: spread out at bottom (fade handles visibility) ===
      const dissT = (raw - 0.80) / 0.20
      const eased = dissT * dissT
      const cascEndX = detachX * 0.6 - 0.30
      const cascEndY = detachY - 0.15 - 2.2

      x = cascEndX + lateral * (0.10 + eased * 0.30)
      y = cascEndY - eased * 0.40
      z = (depthSeed - 0.5) * (0.26 + eased * 0.25)
    }

    return { x, y, z }
  }
}

// ==================== Formation Registry ====================

export const FORMATION_NAMES: FormationName[] = [
  'diffuse',
  'lorenz',
  'shell',
  'rhodonea',
  'aizawa',
  'helix',
  'rossler',
  'harmonics',
  'klein',
  'clifford',
  'cinquefoil',
  'thomas',
  'halvorsen',
  'mobius',
  'trefoil',
  'torus',
  'milkyway',
]

export const formations: Record<FormationName, FormationGenerator> = {
  diffuse,
  lorenz,
  rhodonea,
  clifford,
  trefoil,
  torus,
  aizawa,
  harmonics,
  thomas,
  helix,
  mobius,
  shell,
  rossler,
  klein,
  cinquefoil,
  halvorsen,
  milkyway,
}

// Formations that support time-dependent living motion
export const LIVING_MOTION: Partial<Record<FormationName, boolean>> = {
  rhodonea: true,
  trefoil: true,
  clifford: true,
  aizawa: true,
  harmonics: true,
  thomas: true,
  helix: true,
  mobius: true,
  shell: true,
  rossler: true,
  klein: true,
  cinquefoil: true,
  halvorsen: true,
  milkyway: true,
}

// Color palettes per formation [primary, secondary] as RGB arrays
export const FORMATION_COLORS: Record<FormationName, { a: [number, number, number]; b: [number, number, number] }> = {
  diffuse:    { a: [0.4, 0.6, 1.0],   b: [0.6, 0.4, 1.0] },    // cool cyan-purple
  lorenz:     { a: [1.0, 0.7, 0.2],   b: [1.0, 0.3, 0.15] },   // warm amber-red
  shell:      { a: [0.95, 0.8, 0.55], b: [0.85, 0.55, 0.3] },  // warm pearl-sand
  rhodonea:   { a: [1.0, 0.45, 0.55], b: [1.0, 0.6, 0.4] },    // warm pink-coral
  aizawa:     { a: [0.7, 0.2, 0.8],   b: [1.0, 0.5, 0.15] },   // magenta-orange
  helix:      { a: [0.3, 0.95, 0.5],  b: [0.7, 1.0, 0.3] },    // bioluminescent lime
  rossler:    { a: [0.2, 0.6, 1.0],   b: [0.5, 0.9, 1.0] },    // electric cyan
  harmonics:  { a: [0.3, 0.7, 1.0],   b: [0.95, 0.95, 1.0] },  // ice-blue-white
  klein:      { a: [0.55, 0.15, 0.85], b: [0.95, 0.45, 0.65] }, // deep violet-magenta
  clifford:   { a: [0.35, 0.3, 0.95], b: [1.0, 0.55, 0.2] },   // indigo-orange
  cinquefoil: { a: [1.0, 0.85, 0.3],  b: [1.0, 0.95, 0.7] },   // star gold-white
  thomas:     { a: [0.2, 0.8, 0.5],   b: [0.85, 0.8, 0.2] },   // emerald-gold
  halvorsen:  { a: [0.9, 0.15, 0.2],  b: [1.0, 0.6, 0.15] },   // crimson-flame
  mobius:     { a: [0.85, 0.5, 0.35], b: [1.0, 0.75, 0.5] },   // warm copper-gold
  trefoil:    { a: [0.25, 0.85, 0.7], b: [0.95, 0.8, 0.25] },  // teal-gold
  torus:      { a: [0.8, 0.3, 0.9],   b: [1.0, 0.4, 0.3] },    // purple-red
  milkyway:   { a: [0.35, 0.55, 1.0],  b: [0.92, 0.85, 1.0] },  // deep celestial blue → bright violet-white
}

// Per-formation light chain visual and behavior config
export const FORMATION_CHAIN_CONFIG: Record<FormationName, ChainFormationConfig> = {
  diffuse: {
    roamColor:  { tail: [0.15, 0.1, 0.4],   head: [0.4, 0.5, 1.0] },
    chaseColor: { tail: [0.6, 0.4, 0.1],    head: [1.0, 0.9, 0.4] },
    curvatureBias: 0.3, speedScale: 1.0, maxLength: 15,
  },
  lorenz: {
    roamColor:  { tail: [0.3, 0.12, 0.05],  head: [0.7, 0.3, 0.1] },
    chaseColor: { tail: [0.8, 0.5, 0.1],    head: [1.0, 0.85, 0.35] },
    curvatureBias: 0.6, speedScale: 1.2, maxLength: 15,
  },
  shell: {
    roamColor:  { tail: [0.25, 0.18, 0.08], head: [0.6, 0.45, 0.25] },
    chaseColor: { tail: [0.7, 0.55, 0.2],   head: [1.0, 0.9, 0.5] },
    curvatureBias: 0.4, speedScale: 1.0, maxLength: 15,
  },
  rhodonea: {
    roamColor:  { tail: [0.3, 0.08, 0.2],   head: [0.7, 0.2, 0.45] },
    chaseColor: { tail: [0.8, 0.45, 0.3],   head: [1.0, 0.8, 0.55] },
    curvatureBias: 0.5, speedScale: 0.9, maxLength: 15,
  },
  helix: {
    roamColor:  { tail: [0.05, 0.25, 0.12], head: [0.2, 0.7, 0.35] },
    chaseColor: { tail: [0.5, 0.7, 0.15],   head: [0.9, 1.0, 0.4] },
    curvatureBias: 0.4, speedScale: 1.0, maxLength: 15,
  },
  rossler: {
    roamColor:  { tail: [0.05, 0.15, 0.35], head: [0.2, 0.4, 0.8] },
    chaseColor: { tail: [0.4, 0.7, 0.7],    head: [0.9, 1.0, 1.0] },
    curvatureBias: 0.55, speedScale: 1.1, maxLength: 14,
  },
  clifford: {
    roamColor:  { tail: [0.1, 0.08, 0.35],  head: [0.3, 0.2, 0.75] },
    chaseColor: { tail: [0.7, 0.4, 0.1],    head: [1.0, 0.7, 0.25] },
    curvatureBias: 0.8, speedScale: 1.4, maxLength: 12,
  },
  klein: {
    roamColor:  { tail: [0.15, 0.04, 0.3],  head: [0.4, 0.12, 0.6] },
    chaseColor: { tail: [0.7, 0.3, 0.4],    head: [1.0, 0.65, 0.6] },
    curvatureBias: 0.45, speedScale: 1.0, maxLength: 15,
  },
  cinquefoil: {
    roamColor:  { tail: [0.2, 0.18, 0.06],  head: [0.5, 0.45, 0.15] },
    chaseColor: { tail: [0.7, 0.65, 0.3],   head: [1.0, 0.95, 0.6] },
    curvatureBias: 0.5, speedScale: 1.1, maxLength: 18,
  },
  halvorsen: {
    roamColor:  { tail: [0.25, 0.04, 0.05], head: [0.6, 0.1, 0.12] },
    chaseColor: { tail: [0.8, 0.45, 0.1],   head: [1.0, 0.8, 0.25] },
    curvatureBias: 0.6, speedScale: 1.2, maxLength: 16,
  },
  mobius: {
    roamColor:  { tail: [0.25, 0.12, 0.08], head: [0.6, 0.35, 0.2] },
    chaseColor: { tail: [0.7, 0.55, 0.2],   head: [1.0, 0.85, 0.45] },
    curvatureBias: 0.45, speedScale: 1.0, maxLength: 15,
  },
  trefoil: {
    roamColor:  { tail: [0.06, 0.22, 0.18], head: [0.2, 0.65, 0.5] },
    chaseColor: { tail: [0.5, 0.7, 0.3],    head: [0.95, 0.95, 0.4] },
    curvatureBias: 0.5, speedScale: 1.1, maxLength: 18,
  },
  torus: {
    roamColor:  { tail: [0.2, 0.06, 0.3],   head: [0.55, 0.2, 0.65] },
    chaseColor: { tail: [0.7, 0.35, 0.4],   head: [1.0, 0.6, 0.55] },
    curvatureBias: 0.45, speedScale: 1.0, maxLength: 15,
  },
  aizawa: {
    roamColor:  { tail: [0.2, 0.05, 0.3],   head: [0.5, 0.15, 0.6] },
    chaseColor: { tail: [0.7, 0.4, 0.1],    head: [1.0, 0.75, 0.3] },
    curvatureBias: 0.6, speedScale: 1.2, maxLength: 16,
  },
  harmonics: {
    roamColor:  { tail: [0.08, 0.15, 0.35], head: [0.25, 0.5, 0.85] },
    chaseColor: { tail: [0.6, 0.6, 0.5],    head: [1.0, 0.95, 0.7] },
    curvatureBias: 0.35, speedScale: 0.9, maxLength: 15,
  },
  thomas: {
    roamColor:  { tail: [0.05, 0.2, 0.12],  head: [0.15, 0.6, 0.35] },
    chaseColor: { tail: [0.6, 0.5, 0.15],   head: [0.95, 0.85, 0.3] },
    curvatureBias: 0.5, speedScale: 1.1, maxLength: 16,
  },
  milkyway: {
    roamColor:  { tail: [0.10, 0.15, 0.45],  head: [0.45, 0.55, 0.95] },
    chaseColor: { tail: [0.55, 0.60, 0.85],  head: [0.92, 0.90, 1.0] },
    curvatureBias: 0.40, speedScale: 1.1, maxLength: 12,
  },
}

export function computeFormationPositions(
  name: FormationName,
  total: number,
  out: Float32Array,
  time?: number,
): void {
  const gen = formations[name]
  for (let i = 0; i < total; i++) {
    const p = gen(i, total, time)
    const i3 = i * 3
    out[i3] = p.x
    out[i3 + 1] = p.y
    out[i3 + 2] = p.z
  }
}
