## ADDED Requirements

### Requirement: Cloud zone click effect - cloud burst
When the user clicks within the cloud zone, cloud particles near the click point SHALL gather inward briefly then explode outward, creating a cloud burst effect.

#### Scenario: Particles gather before explosion
- **WHEN** the user clicks in the cloud zone
- **THEN** nearby cloud particles are attracted toward the click point for a brief moment (approximately 0.2s) before being repelled outward

#### Scenario: Explosion disperses particles
- **WHEN** the gather phase completes
- **THEN** the gathered particles explode outward from the click point with randomized velocities, gradually returning to normal drift behavior

### Requirement: Water zone click effect - splash
When the user clicks within the water zone, a multi-ring splash effect SHALL emanate from the click point, simulating an object dropping into water.

#### Scenario: Multi-ring splash emanates
- **WHEN** the user clicks in the water zone
- **THEN** multiple concentric splash rings emanate outward from the click point, with water particles displaced upward at each ring

#### Scenario: Splash settles over time
- **WHEN** the splash effect propagates
- **THEN** the water particles gradually settle back to their wave oscillation patterns within approximately 2 seconds

### Requirement: Dune zone click effect - sand eruption
When the user clicks within the dune zone, dune particles near the click point SHALL喷射 upward in a fountain-like eruption, then gradually settle back down.

#### Scenario: Sand particles erupt upward
- **WHEN** the user clicks in the dune zone
- **THEN** nearby dune particles are propelled upward in a cone-shaped eruption pattern from the click point

#### Scenario: Erupted particles settle with gravity
- **WHEN** the eruption completes
- **THEN** the erupted particles fall back down under simulated gravity and settle into the dune formation

### Requirement: Starfield zone click effect - supernova
When the user clicks within the starfield zone, a bright supernova burst effect SHALL emanate from the click point, with particles radiating outward in a brilliant flash.

#### Scenario: Supernova burst occurs
- **WHEN** the user clicks in the starfield zone
- **THEN** a bright flash of light occurs at the click point, and nearby star particles radiate outward in an expanding sphere pattern

#### Scenario: Supernova fades gradually
- **WHEN** the supernova burst completes
- **THEN** the radiated particles gradually slow and return to their twinkling behavior, and the brightness flash fades

### Requirement: Click effects do not disrupt non-affected particles
Click effects SHALL only affect particles within a defined radius of the click point, leaving particles outside the radius in their normal behavior state.

#### Scenario: Localized effect scope
- **WHEN** a click effect is triggered in any zone
- **THEN** only particles within the effect's defined radius are affected, and particles outside this radius continue their normal behavior uninterrupted
