## 1. Types and Store Foundation

- [x] 1.1 Update `src/types/index.ts` with new types: `FormationName` enum, `FormationState`, `ClickInteraction` (shockwave/blackhole/collapse), `MouseTrail`, remove zone-specific types
- [x] 1.2 Rewrite `src/store/useStore.ts` with formation state (currentIndex, targetIndex, morphProgress, paused), advanced interaction state (activeClick type/position/time, mouseTrail points), remove zone/sunrise state

## 2. Formation Library

- [x] 2.1 Create `src/particles/formations.ts` with type `FormationGenerator = (index: number, total: number, params?: object) => {x: number, y: number, z: number}`
- [x] 2.2 Implement Diffuse formation: random positions in a 6x2x2 field
- [x] 2.3 Implement Lorenz attractor formation: iterate the ODE system, distribute particles along trajectory, scale to viewport
- [x] 2.4 Implement Fibonacci spiral formation: golden angle phyllotaxis, radius = sqrt(index), scale to viewport
- [x] 2.5 Implement Lissajous curve formation: parametric x=sin(3t+pi/2), y=sin(2t), z variation, distribute particles along parameter t
- [x] 2.6 Implement Torus formation: uniform sampling on torus surface with major/minor radius, include Z depth

## 3. Core Particle Engine (ParticleField Rewrite)

- [x] 3.1 Rewrite `src/particles/ParticleField.tsx`: initialize 10K particles with Float32Array buffers (positions, targetPositions, colors, sizes, phases), start in Diffuse formation
- [x] 3.2 Implement morph system in useFrame: lerp positions toward targetPositions with elastic easing, staggered per-particle delay based on distance
- [x] 3.3 Implement formation switching: on trigger, compute new targetPositions from formation library, reset morph progress
- [x] 3.4 Implement auto-cycle timer (~10s) that advances formation index, with reset on manual input
- [x] 3.5 Add per-formation color palette uniforms (uColorA, uColorB, uMorphProgress) and per-particle micro-motion (breathing oscillation)

## 4. Glow Shader

- [x] 4.1 Write vertex shader: pass vColor, vSize, compute gl_PointSize with pixel ratio and size pulsation (sin(time + phase) * 0.1)
- [x] 4.2 Write fragment shader: Gaussian falloff `exp(-dist*dist*8.0)`, HDR core `exp(-dist*dist*30.0) * 2.0`, additive output
- [x] 4.3 Add shader uniforms: uTime, uPixelRatio, uColorA (vec3), uColorB (vec3), uMorphProgress (float), uMousePos (vec2), uMouseSpeed (float)
- [x] 4.4 Implement per-formation color blending in fragment shader using uMorphProgress to lerp between palettes
- [x] 4.5 Implement mouse proximity color heating in fragment shader: shift toward white based on distance to uMousePos

## 5. Advanced Interactions

- [x] 5.1 Update `src/hooks/useMouseTracking.ts`: add double-click detection (300ms threshold), long-press detection (300ms hold), emit events to store
- [x] 5.2 Implement mouse gravity field in ParticleField useFrame: attract particles toward cursor when mouse speed < 2, with minimum distance threshold
- [x] 5.3 Implement fast-mouse cutting trail: push particles away perpendicular to movement direction when speed > 5, store recent mouse positions for trail rendering
- [x] 5.4 Implement single-click shockwave: expanding ring that pushes particles outward, elastic bounce-back to target positions over 1-2s
- [x] 5.5 Implement double-click black hole: spiral-inward vortex phase (~1s) followed by explosive outward release
- [x] 5.6 Implement long-press gravitational collapse: continuous attraction with increasing radius/force during hold, explosion on release proportional to hold duration

## 6. Light Chain Upgrade

- [x] 6.1 Update light chain shader: gradient color from cool blue (tail) to white-hot (head) using per-vertex varying
- [x] 6.2 Set chain head brightness > 1.0 to trigger Bloom glow

## 7. Post-Processing Pipeline

- [x] 7.1 Update `src/App.tsx`: wrap scene in `<EffectComposer>` with `<Bloom>`, `<ChromaticAberration>`, `<Vignette>`, `<Noise>` from `@react-three/postprocessing`
- [x] 7.2 Configure Bloom: intensity 1.5, luminanceThreshold 0.6, luminanceSmoothing 0.3
- [x] 7.3 Configure ChromaticAberration offset [0.002, 0.002], Vignette darkness 0.4, Noise opacity 0.03
- [x] 7.4 Add keyboard event listeners in App.tsx: ArrowLeft, ArrowRight, Space for formation switching and pause

## 8. Cleanup

- [x] 8.1 Remove unused files: `src/scenes/CloudScene.tsx`, `src/scenes/WaterScene.tsx`, `src/scenes/SandScene.tsx`, `src/scenes/StarfieldScene.tsx`
- [x] 8.2 Remove unused modules: `src/particles/ParticleData.ts`, `src/particles/ParticleRenderer.tsx`, `src/particles/physics.ts`, `src/particles/sunrise.ts`, `src/particles/colors.ts`
- [x] 8.3 Remove unused components: `src/components/SunriseOverlay.tsx`, `src/components/StarHint.tsx`, `src/components/HintToast.tsx`
- [x] 8.4 Remove unused store module: `src/store/sunriseSession.ts`
- [x] 8.5 Clean up `src/components/AudioToggle.tsx` if still needed, otherwise remove

## 9. Verification

- [ ] 9.1 Run `npm run typecheck` and fix all type errors
- [ ] 9.2 Run `npm run lint` and fix all lint errors
- [ ] 9.3 Run `npm run build` and verify successful production build
- [ ] 9.4 Manual verification: confirm all 5 formations render and morph correctly, all interactions work, post-processing is visible, 60fps performance
