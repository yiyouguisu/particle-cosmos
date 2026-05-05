## 1. Head State Infrastructure

- [x] 1.1 Add new refs in ParticleField: `headPosRef` (vec2), `headDirRef` (vec2), `chaseWeightRef` (number), `spiralAngleRef` (number)
- [x] 1.2 Initialize head position from the first chain particle's position; initialize direction as a random unit vector
- [x] 1.3 Add inline noise-like function for spiral curvature (multi-frequency sine combination, no external dependency)

## 2. Chase Weight Calculation

- [x] 2.1 Implement smoothstep utility mapping mouse speed from low threshold (~1) to high threshold (~8) into raw chase target (0-1)
- [x] 2.2 Apply exponential smoothing to chase weight each frame: `chaseWeight += (target - chaseWeight) * delta * 3.0`

## 3. Roaming Behavior (Spiral + Explorer)

- [x] 3.1 Implement spiral component: update `spiralAngle` each frame using noise-driven curvature, rotate current direction by the curvature angle
- [x] 3.2 Implement explorer component: compute repulsion vector from nearest 5 chain node positions using inverse-square distance falloff
- [x] 3.3 Blend spiral (weight 0.7) and explorer (weight 0.3) into a combined roam direction vector

## 4. Direction Blending and Head Movement

- [x] 4.1 Blend roam direction and chase direction using `chaseWeight` to produce `finalDir`
- [x] 4.2 Apply direction inertia: `currentDir = normalize(currentDir * 0.85 + finalDir * 0.15)`
- [x] 4.3 Compute speed based on chase weight: `lerp(0.8, 2.5, chaseWeight)` with minor noise variation
- [x] 4.4 Update head position: `headPos += currentDir * speed * delta`

## 5. Boundary Containment

- [x] 5.1 Implement soft boundary: when head exceeds 90% of viewport half-width/height, apply increasing directional bias toward viewport center
- [x] 5.2 Verify head never escapes viewport and curves smoothly back from edges

## 6. Particle Snap-On Collection

- [x] 6.1 Each frame, scan a random subset of particles (~200) for candidates within snap radius (~0.15-0.3) of head position
- [x] 6.2 Select nearest non-chain particle within radius and append to chain; drop oldest if chain exceeds MAX_CHAIN_LENGTH
- [x] 6.3 Handle edge case: no particles in range — chain retains current nodes, head continues moving

## 7. Visual State Gradient

- [x] 7.1 Interpolate line head color between cool blue (roam) and warm gold (chase) based on `chaseWeight`
- [x] 7.2 Interpolate line tail color between deep purple (roam) and deep orange (chase)
- [x] 7.3 Modulate opacity along the chain: higher opacity when chasing, softer when roaming
- [x] 7.4 Update line geometry rendering to use head position as the final point (replacing the old particle-interpolated head)

## 8. Remove Old Light Chain Logic

- [x] 8.1 Remove the old `chainProgressRef`-based discrete jumping logic (lines ~531-603)
- [x] 8.2 Ensure line geometry draw range and attribute updates work with the new chain structure

## 9. Integration Verification

- [x] 9.1 Verify fast mouse movement causes visible light chain pursuit toward cursor
- [x] 9.2 Verify stationary mouse produces smooth spiral/exploratory roaming patterns
- [x] 9.3 Verify chase-to-roam and roam-to-chase transitions are smooth with no directional snaps
- [x] 9.4 Verify color/brightness transitions between chase and roam states
- [x] 9.5 Run build to confirm no type errors or warnings
