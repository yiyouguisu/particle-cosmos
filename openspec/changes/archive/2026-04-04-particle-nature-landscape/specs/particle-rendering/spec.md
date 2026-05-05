## ADDED Requirements

### Requirement: Particle system rendering with InstancedMesh
The system SHALL render approximately 7000 particles across three independent canvas instances using THREE.InstancedMesh, maintaining a target frame rate of 60fps on mid-range hardware.

#### Scenario: Render particle count across zones
- **WHEN** the scene is fully loaded and rendered
- **THEN** the cloud zone renders approximately 1500 particles, the water zone renders approximately 2500 particles, and the dune zone renders approximately 2000 particles

#### Scenario: Maintain target frame rate
- **WHEN** the page is viewed on a mid-range desktop device
- **THEN** the rendering maintains at least 60fps as measured by browser performance tools

#### Scenario: Pure black background
- **WHEN** the scene is rendered
- **THEN** the background color behind all canvases is pure black (#000000)

### Requirement: Vertical zone layout
The system SHALL display three vertically stacked scene zones (cloud, water, dune) occupying the full viewport height, with each zone taking a proportional share of the screen.

#### Scenario: Zone height proportions
- **WHEN** the page is loaded on a desktop viewport
- **THEN** the cloud zone occupies approximately 25% of viewport height, the water zone occupies approximately 40%, and the dune zone occupies approximately 35%

#### Scenario: Full viewport coverage
- **WHEN** the page is loaded
- **THEN** the combined zones cover 100% of the viewport width and height with no scrollbars

### Requirement: Visual boundary blending between zones
The system SHALL create smooth visual transitions between adjacent zones using overlapping particle regions with blended colors and behaviors, avoiding hard dividing lines.

#### Scenario: Cloud-to-water boundary blending
- **WHEN** viewing the boundary between the cloud zone and water zone
- **THEN** cloud particles near the boundary gradually change color from golden-orange to deep blue, and some cloud particles drift slightly into the water zone with fading opacity

#### Scenario: Water-to-dune boundary blending
- **WHEN** viewing the boundary between the water zone and dune zone
- **THEN** water wave particles near the boundary gradually decrease in amplitude, transition color from blue to warm orange-brown, and dune particles near the boundary show a slightly darker, "wet" appearance

### Requirement: Post-processing effects
The system SHALL apply bloom (glow) and vignette (darkened edges) post-processing effects to enhance the visual quality of each zone.

#### Scenario: Bloom effect applied
- **WHEN** the scene is rendered
- **THEN** bright particles and light areas exhibit a soft glow effect via bloom post-processing

#### Scenario: Vignette effect applied
- **WHEN** the scene is rendered
- **THEN** the edges and corners of the viewport are slightly darkened via vignette post-processing, drawing focus to the center

### Requirement: Pixel ratio capping
The system SHALL cap the device pixel ratio at a maximum of 1.5 to balance visual quality and performance on high-DPI displays.

#### Scenario: High-DPI display handling
- **WHEN** the page is viewed on a device with devicePixelRatio > 1.5
- **THEN** the rendering pixel ratio is capped at 1.5
