## ADDED Requirements

### Requirement: Cloud zone wind physics
The cloud zone SHALL simulate wind-driven particle drift, where particles move slowly in a generally horizontal direction with gentle vertical oscillation and random turbulence.

#### Scenario: Automatic cloud particle drift
- **WHEN** no user interaction is occurring in the cloud zone
- **THEN** cloud particles drift slowly in a generally horizontal direction with slight random vertical oscillation

#### Scenario: Turbulence variation
- **WHEN** the cloud zone physics runs over time
- **THEN** the wind direction and intensity vary randomly within defined bounds, creating natural-looking cloud movement

### Requirement: Water zone wave physics
The water zone SHALL simulate wave motion using sinusoidal oscillation, where particles move in coordinated wave patterns that propagate across the zone.

#### Scenario: Automatic wave oscillation
- **WHEN** no user interaction is occurring in the water zone
- **THEN** water particles oscillate in sinusoidal wave patterns with varying amplitude and frequency across the zone

#### Scenario: Multiple wave layers
- **WHEN** the water zone renders
- **THEN** multiple wave layers with different frequencies and phases create complex, natural-looking water movement

### Requirement: Dune zone terrain physics
The dune zone SHALL simulate slowly shifting sand dune contours, where particles form terrain shapes that gradually morph over time.

#### Scenario: Automatic dune contour shifting
- **WHEN** no user interaction is occurring in the dune zone
- **THEN** the sand dune particle formations slowly shift their contours, creating a sense of living, breathing terrain

### Requirement: Zone boundary behavior blending
At zone boundaries, particles SHALL exhibit blended behaviors from both adjacent zones, creating smooth transitions rather than abrupt behavior changes.

#### Scenario: Cloud-water boundary behavior blend
- **WHEN** a cloud particle approaches the cloud-water boundary
- **THEN** the particle's behavior gradually transitions from wind-driven drift to subtle wave-like oscillation

#### Scenario: Water-dune boundary behavior blend
- **WHEN** a water particle approaches the water-dune boundary
- **THEN** the particle's wave amplitude gradually decreases and its color shifts toward the dune palette

### Requirement: Particle damping and boundary containment
All particles SHALL be subject to velocity damping (simulating air resistance) and boundary containment (particles stay within or near their designated zones).

#### Scenario: Velocity damping
- **WHEN** a particle receives a force impulse
- **THEN** the particle's velocity gradually decreases over time due to damping, preventing perpetual motion

#### Scenario: Boundary containment
- **WHEN** a particle approaches the edge of its zone
- **THEN** the particle is either wrapped to the opposite edge, bounced back, or faded out and respawned, maintaining zone integrity
