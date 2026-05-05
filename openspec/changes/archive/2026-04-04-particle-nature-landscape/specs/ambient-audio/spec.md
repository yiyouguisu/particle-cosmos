## ADDED Requirements

### Requirement: Ambient audio synthesis
The system SHALL synthesize ambient environmental audio using the Web Audio API, including wind sounds for the cloud zone, wave sounds for the water zone, and sand/wind sounds for the dune zone.

#### Scenario: Wind sound synthesis
- **WHEN** the audio system is active
- **THEN** a continuous wind sound is generated using filtered noise, with intensity modulated based on cloud zone particle activity

#### Scenario: Wave sound synthesis
- **WHEN** the audio system is active
- **THEN** a continuous wave sound is generated using amplitude-modulated noise, with rhythm matching the water zone wave patterns

#### Scenario: Sand sound synthesis
- **WHEN** the audio system is active
- **THEN** a subtle sand/wind sound is generated using high-frequency filtered noise, playing continuously in the background

### Requirement: Interaction-triggered audio effects
The system SHALL produce audio feedback for user interactions, including splash sounds for water clicks, burst sounds for cloud clicks, and sand eruption sounds for dune clicks.

#### Scenario: Water click splash sound
- **WHEN** the user clicks in the water zone
- **THEN** a brief splash sound is played, synthesized using a noise burst with frequency decay

#### Scenario: Cloud click burst sound
- **WHEN** the user clicks in the cloud zone
- **THEN** a brief wind burst sound is played, synthesized using a filtered noise burst

#### Scenario: Dune click eruption sound
- **WHEN** the user clicks in the dune zone
- **THEN** a brief sand spray sound is played, synthesized using a high-frequency noise burst

### Requirement: Audio enabled by default
The ambient audio system SHALL be enabled by default when the page loads, starting with the sunrise animation audio.

#### Scenario: Audio starts with page load
- **WHEN** the user loads the page
- **THEN** the audio system is active by default, with ambient sounds beginning during the sunrise animation

#### Scenario: Audio synchronized with sunrise
- **WHEN** the sunrise animation plays
- **THEN** audio layers are introduced sequentially matching the visual sunrise (low hum at horizon glow, waves at water formation, wind at cloud formation)

### Requirement: Audio toggle control
The system SHALL provide a visible audio toggle button in the top-right corner of the screen, allowing users to enable or disable all audio.

#### Scenario: Toggle button visible
- **WHEN** the page is loaded
- **THEN** a speaker icon button is visible in the top-right corner of the screen

#### Scenario: Toggle disables all audio
- **WHEN** the user clicks the audio toggle button to disable audio
- **THEN** all ambient and interaction sounds are immediately muted, and the icon changes to indicate muted state

#### Scenario: Toggle re-enables audio
- **WHEN** the user clicks the audio toggle button while audio is muted
- **THEN** all audio resumes playing, and the icon changes to indicate active state

### Requirement: No external audio files
All audio SHALL be synthesized procedurally using Web Audio API oscillators, noise generators, and filters, with no external audio file dependencies.

#### Scenario: Audio works without network requests
- **WHEN** the page loads with no network connectivity (after initial load)
- **THEN** all audio functions work correctly without requiring external audio file downloads
