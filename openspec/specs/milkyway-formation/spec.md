## ADDED Requirements

### Requirement: Milkyway cascade path structure
The milkyway formation SHALL define a three-segment path: an arc segment (t ∈ [0, 0.5]) forming a wide celestial river arc across the upper portion of the viewport, a convergence segment (t ∈ [0.5, 0.7]) narrowing into a channel, and a cascade segment (t ∈ [0.7, 1.0]) where particles accelerate downward in a parabolic fall.

#### Scenario: Arc segment shape
- **WHEN** a particle's path parameter t is in [0, 0.5]
- **THEN** the particle SHALL be positioned along a wide elliptical arc in the upper portion of the viewport with lateral spread width of approximately 0.15 world units

#### Scenario: Convergence segment shape
- **WHEN** a particle's path parameter t is in [0.5, 0.7]
- **THEN** the particle SHALL be positioned in a narrowing channel that transitions from the arc width to approximately 0.03 world units

#### Scenario: Cascade segment shape
- **WHEN** a particle's path parameter t is in [0.7, 1.0]
- **THEN** the particle SHALL be positioned along a downward-accelerating parabolic path with spread gradually widening from 0.03 to approximately 0.12 world units

### Requirement: Continuous particle flow along path
The milkyway formation SHALL implement continuous particle flow by advancing each particle's path parameter over time using the formula `t = ((index / total) + time * flowSpeed) % 1.0`, producing seamless looping motion where particles appear to flow from the arc through the convergence and cascade back to the arc.

#### Scenario: Particles flow continuously
- **WHEN** the milkyway formation is active and time advances
- **THEN** all particles SHALL continuously move along the path, cycling seamlessly from cascade end back to arc beginning

#### Scenario: Flow speed produces visible motion
- **WHEN** the milkyway formation is displayed
- **THEN** the flow speed SHALL be calibrated so that the streaming motion is clearly visible but not so fast that individual particle trajectories cannot be perceived

### Requirement: Variable density through non-linear t mapping
The milkyway formation SHALL apply non-linear mapping to the path parameter so that particles are denser (appear slower) in the arc segment and sparser (appear faster) in the cascade segment, creating the visual impression of acceleration during the fall.

#### Scenario: Dense arc, sparse cascade
- **WHEN** the milkyway formation is rendered
- **THEN** the particle density in the arc segment SHALL be visibly higher than in the cascade segment, creating the visual impression that particles accelerate as they fall

### Requirement: Milkyway formation registration
The milkyway formation SHALL be registered in all formation configuration maps including FORMATION_NAMES, FORMATION_COLORS (silver-blue palette), FORMATION_CHAIN_CONFIG, and LIVING_MOTION.

#### Scenario: Formation appears in cycle
- **WHEN** the user cycles through formations via scroll wheel or arrow keys
- **THEN** the milkyway formation SHALL appear in the cycle sequence

#### Scenario: Silver-blue color palette
- **WHEN** the milkyway formation is active
- **THEN** particles SHALL display a silver-blue to near-white color gradient

#### Scenario: Living motion enabled
- **WHEN** the milkyway formation is active
- **THEN** it SHALL be marked as a living motion formation, enabling continuous target recomputation via the time parameter
