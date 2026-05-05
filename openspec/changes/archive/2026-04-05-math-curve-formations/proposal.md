## Why

The current formation library covers 5 mathematical shapes but misses several dimensions of mathematical beauty — symmetry (petal patterns), knot topology (3D interlocking curves), and fractal-like strange attractors beyond Lorenz. Additionally, the light chain visuals are decoupled from formation identity: the chain always uses the same blue-to-gold color gradient regardless of which formation is active, creating a visual disconnect. Adding 3 new curve-based formations with living motion (parameter drift) and coordinating the light chain palette/behavior per formation will significantly elevate the visual richness and coherence of the experience.

## What Changes

- **Add Rose Curve (Rhodonea) formation**: Particles arranged in a multi-petal pattern using `r = cos(k*theta)` with `k=5/3`. After morph completes, the `k` parameter slowly drifts over time, causing petals to breathe and restructure.
- **Add Trefoil Knot formation**: Particles distributed on the surface of a (2,3)-torus knot tube. After morph completes, the tube radius pulses and the knot slowly self-rotates in 3D, giving strong depth perception.
- **Add Clifford Attractor formation**: Particles placed via iterated `x' = sin(a*y) + c*cos(a*x)`, `y' = sin(b*x) + d*cos(b*y)`. After morph completes, parameters (a,b,c,d) drift sinusoidally, making the entire attractor pattern morph fluidly as a living structure.
- **Introduce per-formation light chain color palettes**: Each formation defines roam and chase color gradients for the light chain, interpolated via `morphProgress` during transitions so chain colors shift in sync with particle colors.
- **Introduce per-formation light chain behavior parameters**: Each formation defines curvature bias, speed scale, and max chain length for the light chain head, interpolated during transitions so chain movement style adapts to the formation's character.
- **Expand formation count from 5 to 8**: Update cycling order, type definitions, store constants, and all dependent logic.

## Capabilities

### New Capabilities
- `math-curve-formations`: Defines the three new mathematical formations (Rhodonea, Trefoil Knot, Clifford Attractor), their static shape generation, and their post-morph living motion (parameter drift) systems.
- `chain-formation-sync`: Defines how the light chain visual appearance (colors) and movement behavior (curvature, speed, length) adapt per formation and transition smoothly during morphs.

### Modified Capabilities
- `formation-engine`: Expanding the formation library from 5 to 8 entries, updating the cycle sequence, and adding a per-formation "living motion" update mechanism that runs when morphProgress >= 1.
- `dynamic-light-chase`: The visual state gradient requirement changes from hardcoded blue/gold to per-formation color palettes. Chain behavior parameters (curvature, speed) become formation-dependent instead of fixed.

## Impact

- **`src/particles/formations.ts`**: Add 3 new generator functions, new color entries, new chain visual config entries, update `FORMATION_NAMES` array and exports.
- **`src/types/index.ts`**: Extend `FormationName` union type with 3 new values. Add types for chain visual config.
- **`src/store/useStore.ts`**: Update `FORMATION_COUNT` from 5 to 8.
- **`src/particles/ParticleField.tsx`**: Add living motion update logic in the `useFrame` loop (post-morph parameter drift recalculating target positions). Update light chain color/behavior to read per-formation config and interpolate during morphs.
- No new dependencies required. All math is implemented from scratch using standard trigonometric and iterative functions.
