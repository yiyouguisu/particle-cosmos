## ADDED Requirements

### Requirement: Hidden starfield zone at screen edges
The system SHALL provide a hidden starfield zone at the left and right edges of the screen that is not immediately visible but can be discovered through exploration.

#### Scenario: Starfield is not visible initially
- **WHEN** the sunrise animation completes and normal mode begins
- **THEN** the starfield zone is not visually prominent, blending into the dark background at screen edges

#### Scenario: Subtle edge glow hint
- **WHEN** the mouse cursor approaches within a threshold distance of the left or right screen edge
- **THEN** particles at the edge begin to twinkle slightly more noticeably, providing a subtle hint of the hidden zone

### Requirement: Starfield particle behavior
The starfield zone SHALL contain approximately 1000 particles that exhibit twinkling (random opacity oscillation) and occasional shooting star effects.

#### Scenario: Random twinkling
- **WHEN** the starfield zone is active
- **THEN** individual star particles randomly oscillate their opacity, creating a natural twinkling effect

#### Scenario: Occasional shooting stars
- **WHEN** the starfield zone is active
- **THEN** occasional bright particles streak across the starfield in random directions, simulating shooting stars

### Requirement: Mouse trail in starfield
When the mouse moves within the starfield zone, it SHALL leave a trail of stardust particles that persist briefly and then fade.

#### Scenario: Stardust trail follows cursor
- **WHEN** the mouse moves within the starfield zone
- **THEN** new star particles are spawned along the cursor path, creating a glowing trail

#### Scenario: Stardust trail fades
- **WHEN** stardust trail particles are spawned
- **THEN** they gradually fade in opacity and dissipate over approximately 2-3 seconds

### Requirement: Starfield discovery indicator
The system SHALL display a very small star-shaped icon (☆) at the bottom center of the screen as a subtle hint toward the hidden starfield zone.

#### Scenario: Star icon is visible
- **WHEN** the sunrise animation completes
- **THEN** a small, semi-transparent star icon appears at the bottom center of the screen

#### Scenario: Star icon remains persistent
- **WHEN** the user is exploring the scene
- **THEN** the star icon remains visible at low opacity throughout the session, serving as a persistent but unobtrusive hint
