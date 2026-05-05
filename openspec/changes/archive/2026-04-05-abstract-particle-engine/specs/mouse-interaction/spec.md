## MODIFIED Requirements

### Requirement: Mouse speed affects interaction intensity
The intensity of particle interactions SHALL scale with the speed of mouse movement. Slow movement triggers gravity attraction; fast movement triggers repulsion and trail effects.

#### Scenario: Slow mouse activates gravity field
- **WHEN** the user moves the mouse slowly (speed < 2) or is stationary
- **THEN** nearby particles are gently attracted toward the cursor

#### Scenario: Fast mouse activates repulsion and trail
- **WHEN** the user moves the mouse quickly (speed > 5)
- **THEN** nearby particles are pushed away from the cursor path and a glowing trail is visible along the trajectory

### Requirement: Smooth mouse position tracking
The system SHALL track mouse position smoothly across the viewport, interpolating between frames to prevent jittery particle responses.

#### Scenario: Smooth position updates
- **WHEN** the mouse moves across the screen
- **THEN** the tracked mouse position used for particle interactions is smoothly interpolated between frames, producing fluid particle responses

## REMOVED Requirements

### Requirement: Cloud zone mouse interaction - wind push
**Reason**: Zone-specific interactions replaced by universal formation-agnostic interactions (gravity field, cutting trail, color heating).
**Migration**: See `advanced-interactions` spec for new mouse interaction model.

### Requirement: Water zone mouse interaction - ripple effect
**Reason**: Zone-specific interactions replaced by universal formation-agnostic interactions.
**Migration**: See `advanced-interactions` spec for new mouse interaction model.

### Requirement: Dune zone mouse interaction - dust spray
**Reason**: Zone-specific interactions replaced by universal formation-agnostic interactions.
**Migration**: See `advanced-interactions` spec for new mouse interaction model.
