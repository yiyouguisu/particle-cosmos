## ADDED Requirements

### Requirement: Hint toast on first load
The system SHALL display a brief hint message at the bottom of the screen after the sunrise animation completes, guiding the user to explore the scene.

#### Scenario: Hint text appears after sunrise
- **WHEN** the sunrise animation completes at approximately t=2.0s
- **THEN** the hint text "移动鼠标探索 · 点击发现更多" fades in at the bottom center of the screen

#### Scenario: Hint text fades out after 3 seconds
- **WHEN** the hint text has been visible for approximately 3 seconds
- **THEN** the hint text begins to fade out, fully disappearing within 0.5 seconds

#### Scenario: Hint does not repeat
- **WHEN** the user has seen the hint text and it has faded out
- **THEN** the hint text does not reappear during the same session

### Requirement: Audio toggle button
The system SHALL display an audio toggle button in the top-right corner of the screen, visible throughout the session.

#### Scenario: Audio button visible on load
- **WHEN** the page loads
- **THEN** a speaker icon button (🔊) is visible in the top-right corner

#### Scenario: Button indicates audio state
- **WHEN** audio is enabled
- **THEN** the button shows a speaker-with-sound icon (🔊)

- **WHEN** audio is disabled
- **THEN** the button shows a muted speaker icon (🔇)

### Requirement: Starfield hint icon
The system SHALL display a very small star-shaped icon at the bottom center of the screen as a persistent subtle hint toward the hidden starfield zone.

#### Scenario: Star icon appears after sunrise
- **WHEN** the sunrise animation completes
- **THEN** a small star icon (☆) appears at the bottom center of the screen at low opacity

#### Scenario: Star icon persists throughout session
- **WHEN** the user is exploring the scene
- **THEN** the star icon remains visible at low opacity, serving as a persistent but unobtrusive hint

### Requirement: Minimal UI overlay design
All UI elements SHALL be designed with minimal visual impact, using low opacity and small sizes to avoid interfering with the particle scene experience.

#### Scenario: UI elements are subtle
- **WHEN** UI elements are displayed
- **THEN** they use low opacity (approximately 30-50%), small font sizes, and unobtrusive positioning

#### Scenario: UI does not block scene interaction
- **WHEN** the user interacts with the particle scene
- **THEN** UI overlay elements do not intercept or block mouse events intended for the particle canvases (except for the toggle buttons themselves)
