### Requirement: Bloom post-processing effect
The system SHALL apply a Bloom post-processing effect that makes bright particles and the light chain emit a soft glowing halo, using `@react-three/postprocessing` EffectComposer.

#### Scenario: Bloom on bright particles
- **WHEN** the scene is rendered with particles that have HDR brightness values > 1.0
- **THEN** those particles exhibit a visible soft glow that bleeds into surrounding dark areas

#### Scenario: Bloom parameters
- **WHEN** the Bloom effect is active
- **THEN** it uses approximately intensity 1.5, luminance threshold 0.6, and luminance smoothing 0.3

### Requirement: Chromatic aberration effect
The system SHALL apply a subtle chromatic aberration effect to create slight color fringing at the edges of bright elements.

#### Scenario: Visible color fringing
- **WHEN** the scene is rendered
- **THEN** bright elements near the edges of the viewport show slight red/blue color separation with offset approximately 0.002

### Requirement: Vignette effect
The system SHALL apply a vignette effect that darkens the edges and corners of the viewport, focusing attention on the center.

#### Scenario: Darkened edges
- **WHEN** the scene is rendered
- **THEN** the viewport corners and edges are visibly darker than the center, with darkness approximately 0.4

### Requirement: Film noise effect
The system SHALL apply a subtle film noise grain effect to add texture to the otherwise clean rendering.

#### Scenario: Visible grain
- **WHEN** the scene is rendered
- **THEN** a barely perceptible animated noise grain is visible across the viewport at approximately 0.03 opacity

### Requirement: Post-processing pipeline order
The system SHALL apply effects in the order: Bloom first, then ChromaticAberration, Vignette, and Noise last.

#### Scenario: Correct effect ordering
- **WHEN** the EffectComposer renders the post-processing pipeline
- **THEN** Bloom is applied before chromatic aberration, vignette is applied after chromatic aberration, and noise is applied last
