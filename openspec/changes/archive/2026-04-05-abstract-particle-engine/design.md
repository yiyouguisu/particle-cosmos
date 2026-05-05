## Context

The project is a React + Three.js particle visualization (`particle-nature-landscape`) using `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, and `zustand`. Currently, `App.tsx` renders a single `ParticleField` component with 10,000 particles using a basic ShaderMaterial (NormalBlending, hard-edge circles). Four zone scenes exist in `src/scenes/` but are not mounted. The proposal calls for replacing the zone architecture with a formation-morphing abstract art engine featuring mathematical shapes, rich interactions, and post-processing.

Key constraints:
- Keep ~10K particles (no GPGPU needed)
- Pure black background
- All dependencies already installed
- Single-page experience, no routing

## Goals / Non-Goals

**Goals:**
- Deliver a visually striking abstract particle experience with mathematical formation morphing
- Provide layered interactivity: passive mouse effects, click actions, keyboard/scroll formation control
- Achieve smooth 60fps on mid-range hardware with post-processing enabled
- Clean up dead code (unused scenes, modules)

**Non-Goals:**
- Mobile touch optimization (desktop-first; basic touch may work but is not a target)
- Audio-reactive / music visualization (AudioEngine stays as ambient background, no frequency analysis)
- GPGPU or compute-shader particle systems (CPU update loop is sufficient at 10K)
- Saving/sharing/exporting user compositions

## Decisions

### 1. Single ParticleField component vs. modular formation components

**Decision**: Keep a single `ParticleField.tsx` that owns the particle buffers and delegates formation math to a pure `formations.ts` module.

**Rationale**: Particles are always the same set of 10K points — only their target positions change. Having one component manage the Points geometry avoids buffer duplication and simplifies morph transitions. Formation generators are pure functions `(index, total, params) → {x, y, z}` that can be unit-tested independently.

**Alternative rejected**: Separate React components per formation would require transferring buffer ownership or recreating geometry, adding complexity and GC pressure during transitions.

### 2. Points + ShaderMaterial vs. InstancedMesh

**Decision**: Use `<points>` with a custom vertex/fragment ShaderMaterial, replacing the current InstancedMesh approach.

**Rationale**: For 10K same-shape particles where the main visual difference is position, size, and color, Points is more efficient (one draw call, no per-instance matrix). Custom shaders enable HDR core brightness, Gaussian falloff, and per-particle animation in GPU, which InstancedMesh with MeshBasicMaterial cannot achieve.

**Alternative rejected**: InstancedMesh is better when particles need distinct geometry or complex materials, neither of which applies here.

### 3. Formation morph via CPU lerp in useFrame

**Decision**: Each frame, lerp `positions[i]` toward `targetPositions[i]` with an elastic easing factor. When switching formations, recompute `targetPositions` from the new formation generator.

**Rationale**: At 10K particles, CPU lerp in `useFrame` costs <1ms per frame. This keeps the architecture simple — no GPU feedback textures, no transform feedback. The vertex shader receives final positions and only handles visual effects (size pulsation, color).

**Alternative rejected**: GPU morph via two position textures + shader lerp would be warranted at 100K+ particles but adds complexity for no measurable gain at 10K.

### 4. Color computed in shader via uniforms

**Decision**: Pass `uColorA` and `uColorB` (current and next formation themes) plus `uMorphProgress` as uniforms. The fragment shader blends between them based on morph progress and adds mouse proximity heating.

**Rationale**: Avoids updating 10K * 3 color floats per frame on CPU. Color changes are smooth and essentially free on GPU.

### 5. Interaction detection in useMouseTracking hook

**Decision**: Extend `useMouseTracking.ts` to emit `doubleClick` and `longPress` events via the zustand store, alongside existing position/velocity tracking.

**Rationale**: Centralized input handling keeps ParticleField focused on rendering. The store acts as the event bus — ParticleField reads interaction state each frame and applies physics accordingly.

**Alternative rejected**: Putting pointer event handlers directly on the Canvas element would tightly couple input to rendering and make interaction logic harder to test.

### 6. Post-processing via EffectComposer

**Decision**: Wrap the scene in `<EffectComposer>` from `@react-three/postprocessing` with Bloom, ChromaticAberration, Vignette, and Noise effects.

**Rationale**: The package is already installed. EffectComposer handles render target management and effect ordering. Bloom is the single highest-impact visual upgrade for particle systems.

**Parameters**:
- Bloom: intensity ~1.5, luminanceThreshold ~0.6, luminanceSmoothing ~0.3
- ChromaticAberration: offset ~[0.002, 0.002]
- Vignette: darkness ~0.4
- Noise: opacity ~0.03

### 7. Auto-cycle with manual override (hybrid switching)

**Decision**: A `formationIndex` in the store auto-increments every ~10s via a timer. Keyboard left/right, scroll, or clicking empty space resets the timer and jumps to prev/next formation. A `paused` flag (toggled by Space) freezes auto-cycling.

**Rationale**: Auto-cycle provides a screensaver-like experience for passive viewing. Manual override lets engaged users explore at their own pace without fighting the auto-timer.

## Risks / Trade-offs

**[Risk] Bloom over-exposure when particles cluster** → Mitigation: The HDR core brightness value (2.0) is tuned for normal distribution. During black-hole collapse where all particles converge, dynamically reduce the uniform `uCoreBrightness` based on cluster density, or clamp bloom luminance.

**[Risk] Morph transitions may look chaotic with 10K particles flying everywhere** → Mitigation: Use a staggered morph where particles start their transition with a slight delay based on their index or distance from center, creating a wave-like cascade rather than all particles moving simultaneously.

**[Risk] Long-press detection conflicting with normal click** → Mitigation: Use a 300ms threshold for long-press. If released before 300ms, treat as click. Double-click uses the browser's native dblclick event timing (~300ms gap).

**[Trade-off] Removing zone scenes means losing the nature-landscape concept** → Accepted: The user explicitly chose "极致抽象" (extreme abstract) direction. The zone scenes remain in git history if ever needed. The project name in package.json can be updated.

**[Trade-off] CPU-side position updates limit future particle count scaling** → Accepted: At 10K this is not a bottleneck. If the project later needs 100K+, the formation generators can be ported to a GPGPU texture approach with minimal architectural change since they are already pure functions.
