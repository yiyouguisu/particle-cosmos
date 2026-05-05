## Context

The particle visualization system currently supports 5 mathematical formations (diffuse, lorenz, fibonacci, lissajous, torus) with smooth morphing transitions. Each formation is a pure generator function in `formations.ts` that computes static target positions. Post-morph, particles only exhibit a small sinusoidal breathing motion. The light chain system has hardcoded blue-to-gold colors and fixed movement parameters regardless of which formation is active.

The system uses 10,000 particles rendered via custom GLSL shaders with additive blending, managed in a single `useFrame` loop. Formation transitions use smootherstep easing with per-particle stagger delays over ~3.5 seconds. Color transitions already interpolate between formation-specific palettes via `morphProgress`.

## Goals / Non-Goals

**Goals:**
- Add 3 new mathematically elegant formations: Rose Curve (Rhodonea), Trefoil Knot, Clifford Attractor
- Each new formation has a "living motion" mode: after morph completes, parameters drift over time causing continuous organic shape evolution
- Light chain colors and behavior adapt per formation, transitioning in sync with particle morphs
- Maintain 60fps performance with 10,000 particles across all formations

**Non-Goals:**
- No UI changes beyond what already exists (no formation name display, no selection menu)
- No changes to click effects, long-press, or mouse interaction behaviors
- No changes to the audio engine or its formation coupling
- No shader modifications (vertex/fragment shaders remain as-is)
- Not adding more than 3 formations in this change

## Decisions

### Decision 1: Living motion via target position recomputation

**Choice**: Recompute `targetPositions` on every frame when in living motion mode, passing elapsed time as a parameter to the formation generator.

**Alternative considered**: Applying velocity-based perturbation on top of static targets (like the existing breathing motion). Rejected because parameter drift fundamentally changes the shape topology (e.g., rose curve petal count changes), which can't be achieved by small perturbations.

**Approach**: Extend `FormationGenerator` to accept an optional `time` parameter. When `morphProgress >= 1` and the formation supports living motion, call the generator each frame with the current time. The generator uses time to modulate its internal parameters (e.g., `k` for rhodonea, `(a,b,c,d)` for clifford). The drift is slow enough (period ~20-30 seconds) that per-frame recomputation is imperceptible as discontinuity.

### Decision 2: Chain visual config as static data in formations.ts

**Choice**: Extend the existing `FORMATION_COLORS` structure (or create a parallel `FORMATION_CHAIN_CONFIG`) in `formations.ts` to include per-formation chain colors and behavior parameters.

**Alternative considered**: Putting chain config in a separate file. Rejected because co-locating all per-formation visual identity in one place makes it easy to keep palettes harmonious.

**Structure**:
```typescript
FORMATION_CHAIN_CONFIG: Record<FormationName, {
  roamColor: { tail: [r,g,b], head: [r,g,b] }
  chaseColor: { tail: [r,g,b], head: [r,g,b] }
  curvatureBias: number   // 0-1, how curvy the chain head moves
  speedScale: number      // multiplier on base head speed
  maxLength: number       // chain length for this formation
}>
```

### Decision 3: Chain config interpolation shares morphProgress

**Choice**: Use the same `morphProgress` value that drives particle position morphing to also interpolate chain colors and behavior parameters between old and new formation configs.

**Rationale**: This guarantees visual synchronization — chain colors shift at exactly the same rate as particle colors and positions. No additional timing state needed.

### Decision 4: Clifford attractor generation via iteration with caching

**Choice**: Pre-compute Clifford attractor points by iterating from random initial conditions, similar to how Lorenz is implemented. Cache the trajectory and re-generate when parameters change during living motion.

**Key detail**: Clifford is a 2D attractor (no z component from the equations). Z will be derived from iteration index as a gentle wave: `z = sin(i / total * 4pi) * 0.3`. During living motion, the cache is invalidated and recomputed with new parameters each frame — but since the computation is O(n) multiply-add operations, this is fast enough for 10k particles.

### Decision 5: Trefoil knot uses tube surface sampling

**Choice**: Distribute particles on the surface of a tube that follows the trefoil knot curve. Each particle has two parameters: `t` (position along knot, distributed by index) and `s` (angle around tube cross-section, distributed by seeded random).

**Rationale**: A bare curve would have all particles on a 1D line — too thin. A tube gives volume and makes the 3D structure visible from all angles. Tube radius ~0.15 provides good density.

### Decision 6: Formation cycle order

**Choice**: `diffuse → lorenz → rhodonea → fibonacci → clifford → lissajous → trefoil → torus`

**Rationale**: Alternates between different aesthetic categories. Each transition pairs formations that share visual elements:
- lorenz → rhodonea: organic curves
- rhodonea → fibonacci: radial symmetry
- fibonacci → clifford: scatter-to-pattern
- clifford → lissajous: 2D curves
- lissajous → trefoil: curve to 3D knot
- trefoil → torus: 3D tube shapes

## Risks / Trade-offs

**[Performance: living motion recomputation]** → Recomputing 10k positions per frame for Clifford attractor involves 10k iterations of sin/cos. Mitigated by the fact that modern CPUs handle this in <1ms. If framerate drops, can reduce to updating every 2nd or 3rd frame for living motion only.

**[Visual: Clifford parameter drift may produce ugly intermediate states]** → Mitigated by constraining parameter ranges to known-beautiful regions and using smooth sinusoidal interpolation between tested parameter sets.

**[Complexity: chain behavior interpolation]** → Adding per-formation chain behavior on top of existing chase/roam blending creates a 3-way interpolation (formation config x chase weight x morph progress). Mitigated by keeping the config simple (just multipliers and color vectors) and applying them as final-stage modifiers to the existing system.
