## ADDED Requirements

### Requirement: Magnetic vortex force field around mouse
The system SHALL apply a magnetic vortex force to particles near the mouse position, combining a tangential (rotational) component and a radial (attraction/repulsion) component. The force SHALL use inverse-square falloff (`1 / max(d², minDist²)`) within a maximum interaction radius, with perspective-corrected distance calculations consistent with the existing z-depth projection model.

#### Scenario: Slow mouse creates attractive vortex
- **WHEN** the mouse moves slowly (speed < 2) near particles
- **THEN** particles SHALL experience a tangential force causing rotation around the mouse position, combined with a radial inward force, producing a spiral-inward vortex pattern

#### Scenario: Fast mouse creates repulsive vortex
- **WHEN** the mouse moves quickly (speed > 5) near particles
- **THEN** particles SHALL experience a tangential force causing rotation around the mouse position, combined with a radial outward force, producing a spiral-outward dispersal pattern

#### Scenario: Continuous speed-force transition
- **WHEN** the mouse speed is between 1 and 6
- **THEN** the radial force component SHALL transition continuously from attraction to repulsion via smoothstep interpolation, with no discontinuous behavior jumps

#### Scenario: Inverse-square falloff with minimum distance clamp
- **WHEN** a particle is very close to the mouse position (distance approaching zero)
- **THEN** the force magnitude SHALL be clamped by a minimum distance squared threshold (minDist² ≈ 0.01) to prevent force explosion, while still producing concentrated force near the mouse

### Requirement: Rotation direction follows mouse movement
The rotation direction of the vortex SHALL be determined by the cross product of the mouse velocity vector and the radial vector from mouse to particle (`sign(mouseVel.x * r.y - mouseVel.y * r.x)`). This produces a natural "stirring" effect where particles rotate in the direction consistent with the mouse's motion.

#### Scenario: Rightward mouse motion creates natural rotation
- **WHEN** the mouse moves to the right
- **THEN** particles above the mouse SHALL rotate clockwise and particles below SHALL rotate counterclockwise, following the natural stirring direction

#### Scenario: Stationary mouse produces no tangential force
- **WHEN** the mouse is stationary (velocity near zero)
- **THEN** the tangential force component SHALL be zero (cross product is zero), with only the radial component remaining active

### Requirement: Dwell time vortex strengthening
The system SHALL track mouse dwell time and progressively strengthen the magnetic field when the mouse remains in a localized area. The strength multiplier SHALL scale from ×1 (base) to ×3 (maximum) using smoothstep over approximately 4 seconds of dwell.

#### Scenario: Gradual vortex buildup during dwell
- **WHEN** the mouse remains nearly stationary (speed < 1) for several seconds
- **THEN** the vortex force strength SHALL gradually increase, reaching maximum strength (×3) after approximately 4 seconds

#### Scenario: Dwell time resets on fast movement
- **WHEN** the mouse begins moving quickly (speed > 2) after dwelling
- **THEN** the dwell time SHALL decay rapidly (multiplicative decay per frame), causing the strength multiplier to return to base level
