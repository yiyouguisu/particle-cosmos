## ADDED Requirements

### Requirement: Cosmic rumble drone
The system SHALL synthesize a continuous sub-frequency drone using three sine oscillators at approximately 18Hz, 22Hz, and 27Hz, each with independent ultra-slow frequency drift of +/-0.1Hz, producing natural beating patterns.

#### Scenario: Sub-frequency beating
- **WHEN** the audio engine is initialized and enabled
- **THEN** three low-frequency sine oscillators play continuously, and their frequency differences produce audible beating patterns in the 4-9Hz range

#### Scenario: Organic drift
- **WHEN** the cosmic rumble is playing
- **THEN** each oscillator's frequency drifts independently by +/-0.1Hz over slow random-like cycles, ensuring the beating pattern never repeats exactly

### Requirement: Void harmonics drone
The system SHALL synthesize a continuous harmonic layer using pure-fifth stacked oscillators (A1, E2, E3, E4, A4) with microtonal pitch drift of +/-3 to 8 cents over 60-120 second cycles, each filtered through a low-pass filter with cutoff frequencies between 400Hz and 900Hz.

#### Scenario: Pure fifth harmonic stack
- **WHEN** the audio engine is initialized and enabled
- **THEN** five oscillators play at frequencies corresponding to A1(55Hz), E2(82.5Hz), E3(165Hz), E4(330Hz), and A4(440Hz) in a pure-fifth stacking arrangement

#### Scenario: Microtonal drift
- **WHEN** the void harmonics are playing
- **THEN** each oscillator's pitch drifts by +/-3 to 8 cents over periods of 60-120 seconds, creating a sense of never-quite-resolving tension

#### Scenario: Distance filtering
- **WHEN** the void harmonics are playing
- **THEN** each oscillator is filtered through a low-pass filter (cutoffs between 400-900Hz) to simulate sound arriving from a great distance

### Requirement: Solar wind noise layer
The system SHALL synthesize a continuous noise layer using white noise passed through a bandpass filter (Q approximately 1.5) that sweeps between 800Hz and 3000Hz over 45-90 second cycles, with amplitude modulated by a slow LFO.

#### Scenario: Bandpass sweep
- **WHEN** the audio engine is initialized and enabled
- **THEN** a white noise source plays through a bandpass filter that continuously sweeps its center frequency between 800Hz and 3000Hz and back

#### Scenario: Infinite cycling
- **WHEN** a sweep cycle completes
- **THEN** a new sweep cycle begins automatically, creating an uninterrupted continuous effect

### Requirement: Nebula breath
The system SHALL synthesize a sub-audible low-frequency noise surge using white noise through a low-pass filter at 200Hz with an ultra-slow amplitude envelope cycling over 40-60 seconds.

#### Scenario: Pressure wave cycle
- **WHEN** the audio engine is initialized and enabled
- **THEN** a filtered noise layer fades in and out over 40-60 second cycles at near-threshold volume levels, creating a sense of periodic pressure change

### Requirement: Pulsar ping events
The system SHALL generate randomized high-frequency sine tone pings at irregular intervals between 3 and 12 seconds, with random frequency (2000-8000Hz), random stereo panning (-0.7 to +0.7), and a short exponential decay envelope.

#### Scenario: Random ping generation
- **WHEN** the audio engine is active and enabled
- **THEN** a short sine tone ping is generated at a random interval between 3-12 seconds, at a random frequency between 2000-8000Hz, panned to a random stereo position

#### Scenario: Ping echo
- **WHEN** a pulsar ping is generated
- **THEN** the ping is processed through a multi-tap delay (approximately 400ms, 700ms, 1100ms) with decreasing feedback and low-pass filtering, creating 2-3 diminishing echoes

#### Scenario: Ping cleanup
- **WHEN** a pulsar ping's decay and echoes have fully faded
- **THEN** all audio nodes created for that ping are disconnected and eligible for garbage collection

### Requirement: Audio toggle
The system SHALL provide a visible toggle button that enables or disables all background audio with a smooth fade transition.

#### Scenario: Disable audio
- **WHEN** the user clicks the audio toggle while audio is enabled
- **THEN** all audio fades out smoothly over approximately 0.5 seconds and pulsar event scheduling stops

#### Scenario: Enable audio
- **WHEN** the user clicks the audio toggle while audio is disabled
- **THEN** all audio fades in smoothly over approximately 0.5 seconds and pulsar event scheduling resumes

### Requirement: No interaction sounds
The system SHALL NOT produce any audio in response to user click or formation-change interactions. Only continuous background ambient audio and randomized cosmic events SHALL be present.

#### Scenario: Click produces no sound
- **WHEN** the user clicks anywhere in the particle field
- **THEN** no audio feedback is produced

#### Scenario: Formation change produces no sound
- **WHEN** a particle formation transition occurs
- **THEN** no audio feedback is produced

### Requirement: Procedural synthesis only
All audio SHALL be synthesized procedurally using Web Audio API (oscillators, buffer sources, filters, gain nodes, delay nodes, stereo panners). No external audio files SHALL be loaded.

#### Scenario: Offline functionality
- **WHEN** the page is loaded without network connectivity (after initial page load)
- **THEN** all audio functions work correctly without requiring any external file downloads
