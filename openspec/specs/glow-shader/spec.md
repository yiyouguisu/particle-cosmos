### Requirement: Gaussian soft-edge particle rendering
The particle fragment shader SHALL render each particle with a smooth Gaussian falloff from center to edge instead of a hard-edged circle.

#### Scenario: Smooth particle edges
- **WHEN** particles are rendered
- **THEN** each particle's opacity decreases smoothly from full at the center to zero at the edge using a Gaussian function, with no visible hard boundary

### Requirement: HDR core overbright for Bloom pickup
The particle shader SHALL output brightness values greater than 1.0 at the core of each particle, enabling the Bloom post-processing effect to detect and amplify these bright centers.

#### Scenario: Core brightness exceeds 1.0
- **WHEN** particles are rendered
- **THEN** the center of each particle outputs a color value with components > 1.0 (approximately 2.0) which the Bloom pass detects and creates glow from

### Requirement: Additive blending mode
The particle material SHALL use Additive blending so that overlapping particles create brighter combined regions rather than occluding each other.

#### Scenario: Overlapping particles brighten
- **WHEN** two or more particles overlap on screen
- **THEN** the overlapping region appears brighter than either individual particle

### Requirement: Per-formation color themes
Each formation SHALL have a distinct color palette. The shader SHALL blend between the current and target formation's color palettes during morph transitions using uniforms.

#### Scenario: Formation color identity
- **WHEN** a specific formation is active
- **THEN** particles display colors from that formation's palette (e.g., warm amber for Lorenz, cool cyan for Diffuse, green-gold for Fibonacci)

#### Scenario: Smooth color transition during morph
- **WHEN** a formation transition is in progress
- **THEN** particle colors smoothly interpolate from the previous formation's palette to the new formation's palette over the morph duration

### Requirement: Particle size pulsation
Particles SHALL exhibit a subtle periodic size oscillation (breathing effect) driven by time and per-particle phase offset.

#### Scenario: Visible breathing
- **WHEN** particles are at rest in any formation
- **THEN** each particle's size oscillates by approximately +-10% around its base size with a period of approximately 2-4 seconds, with each particle at a different phase

### Requirement: Light chain gradient coloring
The light chain SHALL display a color gradient from cool blue at the tail to white-hot at the head, with brightness sufficient for Bloom to create glow around the head.

#### Scenario: Visible gradient
- **WHEN** the light chain is rendered
- **THEN** the tail end of the chain appears dim blue and the head end appears bright white

#### Scenario: Chain head triggers Bloom
- **WHEN** the light chain head is rendered
- **THEN** the brightness of the head segment is high enough (> 1.0) to trigger visible Bloom glow
