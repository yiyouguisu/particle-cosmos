## 1. Type Definitions & Constants

- [x] 1.1 Extend `FormationName` union type in `src/types/index.ts` with `'rhodonea' | 'trefoil' | 'clifford'`
- [x] 1.2 Add `ChainFormationConfig` type in `src/types/index.ts` for per-formation chain visual/behavior config (roamColor, chaseColor, curvatureBias, speedScale, maxLength)
- [x] 1.3 Update `FORMATION_COUNT` from 5 to 8 in `src/store/useStore.ts`

## 2. New Formation Generators

- [x] 2.1 Implement Rose Curve (Rhodonea) generator in `src/particles/formations.ts` — static `r = cos(k*theta)` with `k=5/3`, particle spread ~0.04-0.08 perpendicular offset, Z spread via seeded random
- [x] 2.2 Implement Trefoil Knot generator in `src/particles/formations.ts` — parametric knot curve with tube surface sampling (radius ~0.15), using `sin(t)+2sin(2t)`, `cos(t)-2cos(2t)`, `-sin(3t)`
- [x] 2.3 Implement Clifford Attractor generator in `src/particles/formations.ts` — iterated map with caching (like Lorenz pattern), default params `a=-1.4, b=1.6, c=1.0, d=0.7`, Z from index wave

## 3. Formation Registry & Colors

- [x] 3.1 Add `rhodonea`, `trefoil`, `clifford` to `FORMATION_NAMES` array in the new cycle order: `diffuse → lorenz → rhodonea → fibonacci → clifford → lissajous → trefoil → torus`
- [x] 3.2 Add entries to `formations` record and `FORMATION_COLORS` for all 3 new formations (rhodonea: pink-coral, trefoil: teal-gold, clifford: indigo-orange)
- [x] 3.3 Add `FORMATION_CHAIN_CONFIG` record with per-formation chain color palettes (roam + chase) and behavior parameters (curvatureBias, speedScale, maxLength) for all 8 formations

## 4. Living Motion System

- [x] 4.1 Extend `FormationGenerator` signature to accept optional `time` parameter for living motion
- [x] 4.2 Implement time-dependent Rhodonea generator — `k` parameter drifts sinusoidally (period ~25s, range ~1.2-2.5)
- [x] 4.3 Implement time-dependent Trefoil generator — tube radius pulsation (period ~5s, range 0.1-0.2) and Y-axis self-rotation (~1 rotation per 50s)
- [x] 4.4 Implement time-dependent Clifford generator — parameters (a,b,c,d) drift with different sinusoidal periods (15-25s) within beautiful ranges
- [x] 4.5 Add living motion flag/detection: a `hasLivingMotion` record or function that identifies which formations support time-dependent updates

## 5. ParticleField Living Motion Integration

- [x] 5.1 In `useFrame` loop, after morph completes (`morphProgress >= 1`), check if current formation has living motion. If yes, call generator with current `time` to recompute `targetPositions` each frame
- [x] 5.2 Ensure living motion deactivates cleanly when a new morph begins (source positions captured from current live positions)

## 6. Light Chain Formation Sync

- [x] 6.1 Import `FORMATION_CHAIN_CONFIG` in `ParticleField.tsx` and add refs for previous/target chain config (similar to color interpolation pattern)
- [x] 6.2 On formation switch, capture previous chain config and set target chain config from the new formation
- [x] 6.3 Replace hardcoded chain color logic (lines ~691-701) with per-formation palette lookup, interpolated by `morphProgress` between previous and target configs
- [x] 6.4 Replace hardcoded chain head speed and curvature with per-formation `speedScale` and `curvatureBias`, interpolated by `morphProgress`
- [x] 6.5 Replace hardcoded `MAX_CHAIN_LENGTH` usage with per-formation `maxLength`, interpolated by `morphProgress` (rounded to integer)

## 7. Verification

- [x] 7.1 Run `npm run build` (or equivalent) to verify no type errors across all modified files
- [x] 7.2 Run lint check to ensure code quality
- [ ] 7.3 Visually verify all 8 formations render correctly and morph transitions are smooth
- [ ] 7.4 Visually verify light chain colors shift per formation and during morph transitions
- [ ] 7.5 Visually verify living motion activates for rhodonea, trefoil, clifford after morph completes
