## ADDED Requirements

### Requirement: Cloud zone mouse interaction - wind push
When the mouse enters the cloud zone, nearby cloud particles SHALL be pushed away from the cursor, simulating wind created by hand movement.

#### Scenario: Particles pushed by mouse
- **WHEN** the mouse cursor moves into the cloud zone
- **THEN** cloud particles within a defined radius of the cursor are pushed away from the cursor position

#### Scenario: Push force decreases with distance
- **WHEN** the mouse is in the cloud zone
- **THEN** the push force applied to each particle is inversely proportional to its distance from the cursor, with no effect beyond the maximum interaction radius

### Requirement: Water zone mouse interaction - ripple effect
When the mouse enters the water zone, it SHALL create ripple effects emanating from the cursor position, simulating a finger touching water.

#### Scenario: Ripple emanates from cursor
- **WHEN** the mouse cursor moves into the water zone
- **THEN** concentric ripple waves emanate outward from the cursor position, displacing water particles

#### Scenario: Ripple amplitude decays over distance
- **WHEN** a ripple propagates through the water zone
- **THEN** the ripple amplitude decreases as the distance from the cursor increases, eventually dissipating

### Requirement: Dune zone mouse interaction - dust spray
When the mouse enters the dune zone, nearby dune particles SHALL be lifted upward and outward, simulating wind blowing sand particles into the air.

#### Scenario: Sand particles lift on mouse approach
- **WHEN** the mouse cursor moves into the dune zone
- **THEN** nearby dune particles are lifted upward and outward from the cursor, creating a dust spray effect

#### Scenario: Dust particles settle over time
- **WHEN** dust particles are lifted from the dune zone
- **THEN** the particles gradually settle back to their original positions due to gravity simulation

### Requirement: Mouse speed affects interaction intensity
The intensity of particle interactions SHALL scale with the speed of mouse movement, with faster movement creating stronger effects.

#### Scenario: Fast mouse movement creates stronger effects
- **WHEN** the user moves the mouse quickly through a zone
- **THEN** the particle interaction forces (push, ripple, spray) are stronger than when the mouse moves slowly

#### Scenario: Stationary mouse has minimal effect
- **WHEN** the mouse is stationary within a zone
- **THEN** the particle interaction effects are minimal or idle, allowing particles to return to their natural behavior

### Requirement: Smooth mouse position tracking
The system SHALL track mouse position smoothly across all zones, interpolating between frames to prevent jittery particle responses.

#### Scenario: Smooth position updates
- **WHEN** the mouse moves across the screen
- **THEN** the tracked mouse position used for particle interactions is smoothly interpolated between frames, producing fluid particle responses
