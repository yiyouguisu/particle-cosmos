## Why

The current background audio uses warm, dreamy pad chords (major 7th voicing) and standard ambient music techniques that evoke a "meditation room" atmosphere. This is mismatched with the project's visual identity -- a particle-based starfield/cosmic universe. The audio needs to be completely replaced with a cold, deep-space soundscape that conveys the vastness and silence of the cosmos.

## What Changes

- **BREAKING**: Remove `playMorphSound()` and `playClickSound()` methods from `AudioEngine` -- all interaction-triggered audio is eliminated
- Replace the entire ambient audio synthesis in `AudioEngine.startAmbient()` with a new cosmic soundscape consisting of:
  - Cosmic rumble: sub-frequency beating drone (16-27Hz) simulating cosmic background radiation
  - Void harmonics: bare perfect-fifth stacked oscillators with microtonal drift
  - Solar wind: filtered noise layer with ultra-slow bandpass sweep
  - Pulsar pings: randomized high-frequency sine pings at irregular intervals with delay/echo
  - Nebula breath: sub-audible low-frequency noise surges on 40-60s cycles
- Add spatialization via multi-tap delay and stereo panning for depth/distance
- Retain the existing audio toggle button (on/off) in the UI
- Remove any call sites for the deleted interaction sound methods

## Capabilities

### New Capabilities
- `cosmic-soundscape`: Procedural deep-space ambient audio synthesis with layered drones, random cosmic events, and spatial depth effects

### Modified Capabilities

(none -- there is no existing audio spec to modify)

## Impact

- `src/audio/AudioEngine.ts`: Full rewrite of ambient synthesis, removal of interaction sound methods
- `src/App.tsx`: May need cleanup if any removed methods are referenced; audio toggle stays as-is
- No new dependencies -- all synthesis remains Web Audio API only
- No API or data model changes
