## MODIFIED Requirements

### Requirement: Particle system rendering with InstancedMesh
The system SHALL render 10,000 particles using a single `<points>` element with custom ShaderMaterial, replacing the previous InstancedMesh approach. The system SHALL maintain a target frame rate of 60fps on mid-range hardware.

#### Scenario: Render particle count
- **WHEN** the scene is fully loaded and rendered
- **THEN** 10,000 particles are rendered in a single draw call using Points geometry

#### Scenario: Maintain target frame rate
- **WHEN** the page is viewed on a mid-range desktop device with post-processing enabled
- **THEN** the rendering maintains at least 60fps as measured by browser performance tools

#### Scenario: Pure black background
- **WHEN** the scene is rendered
- **THEN** the background color is pure black (#000000)

## REMOVED Requirements

### Requirement: Vertical zone layout
**Reason**: Replaced by formation-based layout where all particles share a single coordinate space and morph between mathematical shapes.
**Migration**: Particle distribution is now controlled by formation generators in `formations.ts`.

### Requirement: Visual boundary blending between zones
**Reason**: Zone boundaries no longer exist in the abstract formation architecture.
**Migration**: Color transitions are now handled per-formation via shader uniforms.

### Requirement: Post-processing effects
**Reason**: Moved to dedicated `post-processing` capability spec with expanded scope (Bloom, ChromaticAberration, Vignette, Noise).
**Migration**: See `post-processing` spec.

### Requirement: Pixel ratio capping
**Reason**: Pixel ratio capping remains but moves to a renderer-level config in App.tsx rather than a spec-level requirement.
**Migration**: Set `dpr={[1, 1.5]}` on the Canvas component.
