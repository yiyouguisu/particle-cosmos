## ADDED Requirements

### Requirement: Sunrise animation on first page load
The system SHALL play a sunrise animation on the user's first visit to the page, where particles rise from a glowing horizon line to form the complete three-zone scene.

#### Scenario: Animation triggers on first visit
- **WHEN** the user loads the page for the first time
- **THEN** a sunrise animation plays automatically before normal scene interaction begins

#### Scenario: Horizon glow appears first
- **WHEN** the sunrise animation begins at t=0s
- **THEN** a subtle golden light band appears at the horizon line (bottom of the viewport), gradually increasing in brightness

### Requirement: Particle rising sequence
Particles SHALL animate upward from the horizon line to their final positions in the scene, with zones activating in bottom-to-top order (dunes first, then water, then clouds).

#### Scenario: Dune particles rise first
- **WHEN** the sunrise animation reaches t=0.3s
- **THEN** dune particles begin rising from the horizon line, forming the sand dune轮廓 by approximately t=1.0s

#### Scenario: Water particles rise second
- **WHEN** the sunrise animation reaches t=0.8s
- **THEN** water particles begin rising, forming wave patterns by approximately t=1.5s

#### Scenario: Cloud particles rise last
- **WHEN** the sunrise animation reaches t=1.2s
- **THEN** cloud particles begin rising from the middle area upward, forming cloud shapes by approximately t=1.8s

### Requirement: Scene brightness progression
The overall scene brightness SHALL increase gradually during the sunrise animation, starting from near-black and reaching full brightness when the animation completes.

#### Scenario: Brightness increases over animation duration
- **WHEN** the sunrise animation progresses from t=0s to t=2.0s
- **THEN** the overall scene brightness transitions from near-black to full daylight levels

### Requirement: Transition to normal physics mode
After the sunrise animation completes, the system SHALL seamlessly transition particles from sunrise animation mode to normal interactive physics simulation mode.

#### Scenario: Physics mode activation
- **WHEN** the sunrise animation completes at approximately t=2.0s
- **THEN** all particles switch from sunrise trajectory-based movement to zone-specific physics simulation

### Requirement: Sunrise animation does not repeat on page refresh within session
The system SHALL track whether the sunrise animation has been shown and skip it on subsequent page visits within the same browser session.

#### Scenario: Animation skipped on return visit
- **WHEN** the user navigates away and returns to the page within the same browser session
- **THEN** the scene loads directly in normal interactive mode without playing the sunrise animation
