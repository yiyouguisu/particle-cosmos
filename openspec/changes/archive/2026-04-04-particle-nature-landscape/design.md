## Context

This is a greenfield project - no existing codebase. The goal is to create a single-page interactive particle nature landscape using React Three Fiber. The page features three vertically-stacked scene zones (clouds, ocean, dunes) with a hidden starfield zone at screen edges, all rendered against a pure black background with a sunrise animation on first load.

**Constraints:**
- Conservative particle count (~7000 total) for 60fps on mid-range devices
- Desktop-first with vertical three-zone layout
- Three independent canvas instances with visual boundary blending
- No external audio files - all audio synthesized via Web Audio API
- Pure black background (#000000)

## Goals / Non-Goals

**Goals:**
- Create an immersive, explorable particle nature landscape
- Achieve smooth 60fps with ~7000 particles on mid-range hardware
- Distinct physics and interaction per zone with smooth boundary blending
- Sunrise animation on first load (particles rising from horizon)
- Hidden starfield discovery through edge exploration
- Synthesized ambient audio with user-toggleable control
- Minimal UI overlay (hint toast, audio toggle, star hint icon)

**Non-Goals:**
- Mobile responsive layout (desktop-only for now)
- User authentication or persistence
- Backend services or APIs
- External audio assets
- Custom shader language (GLSL) complexity - use simple shaders
- Physics engine integration (simple custom physics only)
- Multiple pages or routing

## Decisions

### 1. Three Independent Canvas Instances

**Decision:** Use three separate `<Canvas>` components, one per zone (clouds, water, sand), with CSS positioning to stack them vertically.

**Rationale:**
- Each zone has distinct physics, particle counts, and interaction logic
- Independent rendering allows isolated debugging and performance tuning
- Boundary blending achieved through CSS gradients and overlapping particle zones
- Simpler state management per canvas

**Alternatives considered:**
- Single canvas with all particles: Better performance (fewer draw calls) but much more complex scene management and harder to debug per-zone behavior
- Render targets with compositing: More flexible but adds rendering complexity

### 2. Particle System via InstancedMesh

**Decision:** Use `THREE.InstancedMesh` with a simple sphere/quad geometry for particle rendering, updating instance matrices per frame in `useFrame`.

**Rationale:**
- Single draw call per zone (~3 draw calls total for particles)
- Well-supported in R3F via `@react-three/drei`'s `<Instances>` or manual InstancedMesh
- Simple CPU-based position updates sufficient for 7000 particles
- No need for compute shaders or GPU particle simulation at this scale

**Alternatives considered:**
- `THREE.Points` with custom shader: Fewer draw calls but harder to implement per-particle interaction logic in JS
- GPU particle simulation (transform feedback): Overkill for 7000 particles, adds significant complexity
- Third-party particle libraries: May not support the specific interaction patterns needed

### 3. Simple Custom Physics (No Physics Engine)

**Decision:** Implement lightweight custom physics per zone using simple force calculations in `useFrame` loops.

**Rationale:**
- Each zone needs different physics (wind drift, wave oscillation, terrain deformation)
- A full physics engine (Cannon, Ammo) would be overkill and harder to tune for visual effect
- Simple force-based system (gravity, wind, mouse repulsion/attraction) is sufficient
- Easy to blend behaviors at zone boundaries

**Physics model per particle:**
```
velocity += (gravity + wind + mouseForce + zoneSpecificForce) * delta
position += velocity * delta
velocity *= damping  // air resistance
```

### 4. Boundary Blending via Overlapping Particle Zones

**Decision:** Create transition zones where particles from adjacent zones overlap, with blended visual styles (color gradients, mixed behaviors).

**Rationale:**
- Visually smooth transitions without hard分割 lines
- Cloud particles can "drift down" into the water zone with fading opacity
- Water particles can "lap up" into the dune zone with color blending
- Achieved through careful particle positioning and color assignment

**Alternatives considered:**
- Post-processing gradient overlays: Simpler but less organic
- Hard boundaries with decorative lines: Cleaner look but loses the natural feel

### 5. Sunrise Animation via Animated Target Positions

**Decision:** Each particle has a `sunriseY` trajectory (starting from horizon line) and a `normalY` target (final position). During sunrise phase, particles animate from sunrise positions to normal positions using eased interpolation.

**Rationale:**
- Simple lerp/ease-based animation, no complex timeline system needed
- Particles can have staggered start times based on their zone (bottom zones rise first)
- After sunrise completes, switch to normal physics mode seamlessly

### 6. Synthesized Audio via Web Audio API

**Decision:** Generate all ambient sounds procedurally using Web Audio API oscillators, noise generators, and filters.

**Rationale:**
- No external audio files needed, keeping the project lightweight
- Wind: filtered noise
- Waves: amplitude-modulated noise
- Sand: high-frequency noise bursts
- Starfield nova: frequency sweep
- Can be dynamically modulated based on user interaction

**Alternatives considered:**
- Pre-recorded audio loops: Better quality but adds asset files and less dynamic

### 7. State Management via Zustand

**Decision:** Use Zustand for global state (mouse position, audio enabled/disabled, sunrise phase, interaction states).

**Rationale:**
- Minimal boilerplate compared to Redux
- Works well with React Three Fiber
- No re-render issues with canvas components (can subscribe selectively)
- Small bundle size

### 8. Post-Processing: Bloom + Vignette

**Decision:** Use `@react-three/postprocessing` for bloom (glow effect) and vignette (dark edges) on each canvas.

**Rationale:**
- Bloom enhances the warm sunrise colors and star sparkle
- Vignette focuses attention on center of the screen
- Both are standard, well-optimized effects
- Applied per-canvas for independent control

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Performance degradation with 7000 particles** | Use InstancedMesh (single draw call per zone), simple sphere geometry, throttle physics updates if needed |
| **Three canvases cause rendering overhead** | Monitor GPU usage; fallback to single canvas if needed; use `dpr={[1, 1.5]}` for pixel ratio capping |
| **Boundary blending looks messy** | Carefully tune overlap zone particle counts and colors; add CSS gradient overlays as visual smoothing |
| **Synthesized audio sounds artificial** | Layer multiple noise sources, add subtle randomization, provide audio toggle for users who prefer silence |
| **Hidden starfield never discovered** | Add subtle edge glow when mouse approaches; small star icon hint at bottom; edge particles twinkle slightly |
| **Sunrise animation feels rushed or slow** | Make timing configurable; test with real users; add skip option on second visit |
| **Desktop-only layout excludes mobile users** | Future iteration can add responsive layout; document this limitation |
