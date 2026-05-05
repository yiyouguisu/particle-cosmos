## MODIFIED Requirements

### Requirement: Particle system rendering with Points and ShaderMaterial
The system SHALL render 10,000 particles using a single `<points>` element with custom ShaderMaterial, replacing the previous InstancedMesh approach. The system SHALL maintain a target frame rate of 60fps on mid-range hardware. The formation count SHALL be 17.

#### Scenario: Render particle count
- **WHEN** the scene is fully loaded and rendered
- **THEN** 10,000 particles are rendered in a single draw call using Points geometry

#### Scenario: Maintain target frame rate
- **WHEN** the page is viewed on a mid-range desktop device with post-processing enabled
- **THEN** the rendering maintains at least 60fps as measured by browser performance tools

#### Scenario: Pure black background
- **WHEN** the scene is rendered
- **THEN** the background color is pure black (#000000)
