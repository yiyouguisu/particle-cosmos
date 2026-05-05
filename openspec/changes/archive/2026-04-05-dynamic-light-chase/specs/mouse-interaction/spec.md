## MODIFIED Requirements

### Requirement: Mouse speed affects interaction intensity
The intensity of particle interactions SHALL scale with the speed of mouse movement. Slow movement triggers gravity attraction; fast movement triggers repulsion and trail effects. Additionally, mouse speed SHALL drive the light chain chase weight, determining how strongly the light chain head pursues the mouse position.

#### Scenario: Slow mouse activates gravity field
- **WHEN** the user moves the mouse slowly (speed < 2) or is stationary
- **THEN** nearby particles are gently attracted toward the cursor

#### Scenario: Fast mouse activates repulsion and trail
- **WHEN** the user moves the mouse quickly (speed > 5)
- **THEN** nearby particles are pushed away from the cursor path and a glowing trail is visible along the trajectory

#### Scenario: Mouse speed drives light chain chase weight
- **WHEN** the mouse speed changes
- **THEN** the light chain's `chaseWeight` is updated via exponential smoothing based on a smoothstep of mouse speed between thresholds (~1 to ~8), determining the blend between chase and roam behavior
