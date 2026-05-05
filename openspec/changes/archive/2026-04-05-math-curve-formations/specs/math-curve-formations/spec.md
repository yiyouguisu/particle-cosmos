## ADDED Requirements

### Requirement: Rose Curve (Rhodonea) formation generator
The system SHALL provide a Rose Curve formation that arranges particles in a multi-petal pattern using the polar equation `r = cos(k * theta)` with default `k = 5/3`, producing a visually intricate flower pattern with overlapping petals.

#### Scenario: Petal pattern with k=5/3
- **WHEN** the Rhodonea formation is computed with default parameters
- **THEN** particles form a multi-petal rose pattern with petals extending to approximately 1.8 units from center, with slight random Z spread for depth

#### Scenario: Particle distribution along curve
- **WHEN** 10,000 particles are assigned to the Rhodonea formation
- **THEN** particles are distributed along the curve path with slight random perpendicular offset (spread ~0.04-0.08) to give the curve visual thickness

### Requirement: Rose Curve living motion
After morph completes, the Rhodonea formation SHALL exhibit living motion where the `k` parameter slowly drifts over time using sinusoidal modulation, causing petal count and structure to continuously evolve.

#### Scenario: Parameter drift range
- **WHEN** the Rhodonea formation is in living motion mode
- **THEN** the `k` parameter oscillates smoothly around the base value with a period of approximately 20-30 seconds, staying within a range that produces visually coherent petal patterns (e.g., k between 1.2 and 2.5)

#### Scenario: Continuous position updates during living motion
- **WHEN** living motion is active for Rhodonea
- **THEN** target positions are recomputed each frame with the current time-modulated `k` value, and particles track these moving targets smoothly

### Requirement: Trefoil Knot formation generator
The system SHALL provide a Trefoil Knot formation that distributes particles on the surface of a tube following a (2,3)-torus knot parametric curve: `x = sin(t) + 2*sin(2t)`, `y = cos(t) - 2*cos(2t)`, `z = -sin(3t)`.

#### Scenario: Knot shape with tube volume
- **WHEN** the Trefoil Knot formation is computed
- **THEN** particles form a recognizable three-lobed knot shape with visible 3D depth, distributed on a tube surface of radius ~0.15 around the knot curve

#### Scenario: 3D depth utilization
- **WHEN** the Trefoil Knot formation is rendered
- **THEN** the Z-axis range is at least 0.6 units (significantly more than formations like lissajous), creating strong parallax when the scene is viewed

### Requirement: Trefoil Knot living motion
After morph completes, the Trefoil Knot formation SHALL exhibit living motion with tube radius pulsation and slow self-rotation around the vertical axis.

#### Scenario: Tube radius pulsation
- **WHEN** the Trefoil Knot is in living motion mode
- **THEN** the tube cross-section radius oscillates sinusoidally with a period of approximately 4-6 seconds, varying between 0.1 and 0.2 units

#### Scenario: Slow self-rotation
- **WHEN** the Trefoil Knot is in living motion mode
- **THEN** the entire knot rotates slowly around the Y axis at approximately 1 full rotation per 40-60 seconds, creating a continuously evolving 3D perspective

### Requirement: Clifford Attractor formation generator
The system SHALL provide a Clifford Attractor formation that arranges particles along the trajectory of the iterated map `x' = sin(a*y) + c*cos(a*x)`, `y' = sin(b*x) + d*cos(b*y)` with default parameters `a=-1.4, b=1.6, c=1.0, d=0.7`.

#### Scenario: Attractor pattern
- **WHEN** the Clifford Attractor formation is computed with default parameters
- **THEN** particles form a recognizable strange attractor pattern with swirling, layered structures, scaled to fit within approximately 3.6 units width

#### Scenario: Z-axis from iteration index
- **WHEN** particles are assigned to the Clifford formation
- **THEN** each particle's Z position is derived from its iteration index as a gentle wave, providing subtle depth variation

### Requirement: Clifford Attractor living motion
After morph completes, the Clifford Attractor formation SHALL exhibit living motion where parameters (a, b, c, d) drift sinusoidally over time, causing the attractor pattern to continuously reshape.

#### Scenario: Parameter drift
- **WHEN** the Clifford Attractor is in living motion mode
- **THEN** parameters (a, b, c, d) each oscillate with different periods (15-25 seconds) and small amplitudes around their base values, staying within ranges that produce visually appealing attractor shapes

#### Scenario: Cache invalidation during drift
- **WHEN** parameters change during living motion
- **THEN** the attractor trajectory is recomputed with the new parameters and target positions are updated, producing smooth continuous shape evolution

### Requirement: Per-formation color palettes for new formations
Each new formation SHALL define a unique particle color palette (colorA and colorB) that harmonizes with its mathematical character.

#### Scenario: Rhodonea colors
- **WHEN** the Rhodonea formation is active
- **THEN** the particle color palette uses warm pink-to-coral tones

#### Scenario: Trefoil Knot colors
- **WHEN** the Trefoil Knot formation is active
- **THEN** the particle color palette uses teal-to-gold tones

#### Scenario: Clifford Attractor colors
- **WHEN** the Clifford Attractor formation is active
- **THEN** the particle color palette uses indigo-to-orange tones
