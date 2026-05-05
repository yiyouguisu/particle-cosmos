## Context

The project is an interactive 3D particle universe built with React Three Fiber. The current `AudioEngine` class (`src/audio/AudioEngine.ts`) synthesizes all audio procedurally via Web Audio API -- no external audio files. It currently produces a warm, dreamy ambient pad (major 7th chord voicing) with interaction sounds for morph transitions and click events. The visual theme is a cosmic starfield, but the audio feels like a meditation room. The entire audio engine needs to shift to a cold, deep-space aesthetic.

The engine is a singleton, initialized on first user click, with a master gain node feeding `AudioContext.destination`. The existing toggle (on/off) in `App.tsx` calls `setEnabled()` which fades the master gain.

## Goals / Non-Goals

**Goals:**
- Replace the ambient soundscape with a layered deep-space synthesis that evokes cosmic vastness, cold emptiness, and awe
- Introduce randomized "cosmic event" sounds (pulsar pings) to create a living, non-repetitive soundscape
- Add spatial depth via multi-tap delay and stereo panning
- Keep all synthesis procedural (Web Audio API only, zero external files)
- Retain the audio on/off toggle with smooth fade transitions

**Non-Goals:**
- No interaction-triggered audio (morph sounds, click sounds are removed)
- No music theory / melody / chord progressions -- this is an ambient drone, not music
- No Web Audio API `ConvolverNode` (would require impulse response files)
- No spatial audio (HRTF/panner3D) -- simple stereo panning is sufficient
- No beat sync or BPM-based timing

## Decisions

### 1. Layered drone architecture (5 constant layers + 1 event layer)

Constant layers run continuously; the event layer fires randomized pings at irregular intervals.

| Layer | Purpose | Technique |
|-------|---------|-----------|
| Cosmic Rumble | Sub-frequency presence | 3 sine oscillators at 18/22/27 Hz with ±0.1Hz drift producing natural beating |
| Void Harmonics | Tonal identity | Pure-fifth stacked sines (A1-E2-E3-E4-A4) with microtonal drift (±3-8 cents over 60-120s) through low-pass filters (400-900Hz cutoff) |
| Solar Wind | High-frequency texture | White noise through bandpass filter (Q=1.5) sweeping 800-3000Hz over 45-90s |
| Nebula Breath | Sub-audible pressure | White noise through low-pass (200Hz) with ultra-slow amplitude envelope (40-60s cycle) |
| Deep Echo | Spatial depth on events | Multi-tap delay (400/700/1100ms) with decreasing feedback, feeding through low-pass to darken echoes |
| Pulsar Pings | Living randomness | Random sine pings (2-8kHz), random interval (3-12s), random stereo pan, fed through Deep Echo |

**Rationale**: Pure fifth stacking (A-E-E-E-A) sounds primitive and vast compared to the current major 7th voicing. The beating from near-frequency sub-bass oscillators creates organic pulsation without explicit LFO modulation. Random pulsar pings prevent the soundscape from feeling static.

**Alternative considered**: Using a single complex oscillator with FM synthesis for the drone. Rejected because separate layers give independent control and the beating effect between sub-bass oscillators is more organic than FM.

### 2. Noise generation via AudioBufferSourceNode

Web Audio API has no built-in noise generator. We create a 2-second buffer filled with random samples, set to loop. One noise source feeds both Solar Wind and Nebula Breath through separate filter chains.

**Alternative considered**: Using multiple detuned sawtooth oscillators to approximate noise. Rejected because true white noise gives a more convincing "cosmic radiation" texture.

### 3. Pulsar scheduling via recursive setTimeout

Pings are scheduled with `setTimeout` at random intervals (3-12s). Each timeout creates a short-lived oscillator → gain envelope → delay → stereo panner → master. Nodes are disconnected after decay.

**Alternative considered**: Using `AudioContext.createScriptProcessor` / `AudioWorklet` for sample-accurate scheduling. Rejected as overkill -- slight timing jitter actually enhances the randomness aesthetic.

### 4. Remove interaction sounds entirely

`playMorphSound()` and `playClickSound()` are deleted. The public API surface becomes just `init()`, `setEnabled()`, and `resume()`. This simplifies the class and matches the user's intent of background-only audio.

## Risks / Trade-offs

- **[Browser noise generation]**: Creating a looping noise buffer works across all modern browsers, but the buffer size (2s at 44.1kHz = 88,200 samples) uses ~345KB of memory. Acceptable. → Mitigation: Single shared buffer for all noise-based layers.
- **[Pulsar setTimeout drift]**: `setTimeout` is not sample-accurate and can drift when tab is backgrounded. → Mitigation: This is acceptable -- pings are ambient decoration, not rhythmic. Tab backgrounding naturally pauses audio context anyway.
- **[Sub-bass inaudibility]**: 18Hz is below most speakers' reproduction range. → Mitigation: The 27Hz component and beating patterns between the three oscillators produce audible artifacts in the 4-9Hz range that create a perceptible "pressure" even on limited speakers.
- **[Shimmer sweep finite duration]**: The bandpass sweep on Solar Wind is scheduled for ~90s. → Mitigation: Use a recursive scheduling function that re-arms the sweep every cycle, creating an infinite loop.
