## MODIFIED Requirements

### Requirement: Mouse speed affects interaction intensity
The intensity of particle interactions SHALL scale with the speed of mouse movement. The interaction model uses a magnetic vortex force field: slow movement produces attractive vortex (spiral inward), fast movement produces repulsive vortex (spiral outward), with continuous smoothstep interpolation between regimes. The radial and tangential force components SHALL both use inverse-square falloff. Additionally, mouse speed SHALL drive the light chain chase weight, determining how strongly the light chain head pursues the mouse position. All mouse-to-particle distance calculations SHALL account for perspective projection by adjusting the mouse world coordinate to the particle's z-depth using the formula `adjustedMouse = mouseWorld * (cameraZ - particleZ) / cameraZ`, and interaction radii SHALL scale by the same factor.

#### Scenario: Slow mouse activates magnetic vortex with attraction
- **WHEN** the user moves the mouse slowly (speed < 2) or is stationary
- **THEN** nearby particles SHALL experience a tangential rotational force combined with radial inward attraction, creating a spiral-inward vortex pattern, with perspective-corrected distance at each particle's z-depth

#### Scenario: Fast mouse activates magnetic vortex with repulsion
- **WHEN** the user moves the mouse quickly (speed > 5)
- **THEN** nearby particles SHALL experience a tangential rotational force combined with radial outward repulsion, creating a spiral-outward dispersal pattern, with perspective-corrected distance

#### Scenario: Continuous speed-force regime transition
- **WHEN** the mouse speed transitions between slow and fast ranges
- **THEN** the force behavior SHALL change continuously via smoothstep interpolation across the speed range [1, 6], with no abrupt behavioral jumps at any speed threshold

#### Scenario: Mouse speed drives light chain chase weight
- **WHEN** the mouse speed changes
- **THEN** the light chain's `chaseWeight` is updated via exponential smoothing based on a smoothstep of mouse speed between thresholds (~1 to ~8), determining the blend between chase and roam behavior

#### Scenario: 3D formation mouse interaction accuracy
- **WHEN** the user moves the mouse over particles in a 3D formation with significant z-depth (e.g., harmonics, aizawa, thomas)
- **THEN** the interaction SHALL respond accurately to the screen-space position of particles, not their z=0 projected position

#### Scenario: Consistent screen-space interaction radius
- **WHEN** particles are at different z-depths within the same formation
- **THEN** the interaction radius in screen-space SHALL appear consistent regardless of particle z-depth

### Requirement: Smooth mouse position tracking
The system SHALL track mouse position smoothly across the viewport, interpolating between frames to prevent jittery particle responses.

#### Scenario: Smooth position updates
- **WHEN** the mouse moves across the screen
- **THEN** the tracked mouse position used for particle interactions is smoothly interpolated between frames, producing fluid particle responses
