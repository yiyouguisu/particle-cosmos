## 1. Cleanup and Scaffolding

- [x] 1.1 Remove `playMorphSound()` and `playClickSound()` methods from `AudioEngine.ts`
- [x] 1.2 Remove all call sites for the deleted methods across the codebase (if any)
- [x] 1.3 Strip out existing ambient layers (pad chord, shimmer, sub drone, breath LFO) from `startAmbient()`

## 2. Noise Infrastructure

- [x] 2.1 Implement white noise buffer creation (2-second looping `AudioBuffer` filled with random samples)

## 3. Constant Drone Layers

- [x] 3.1 Implement Cosmic Rumble layer: three sine oscillators at 18/22/27Hz with independent ±0.1Hz frequency drift LFOs
- [x] 3.2 Implement Void Harmonics layer: five oscillators (A1/E2/E3/E4/A4) with low-pass filters (400-900Hz) and microtonal drift (±3-8 cents over 60-120s LFO cycles)
- [x] 3.3 Implement Solar Wind layer: noise source → bandpass (Q~1.5) sweeping 800-3000Hz over 45-90s with amplitude LFO, plus recursive sweep re-scheduling
- [x] 3.4 Implement Nebula Breath layer: noise source → low-pass (200Hz) with ultra-slow gain envelope (40-60s cycle)

## 4. Event Layer and Spatialization

- [x] 4.1 Implement Deep Echo effect chain: multi-tap delay (400/700/1100ms) with decreasing feedback and low-pass darkening filter
- [x] 4.2 Implement Pulsar Ping system: recursive `setTimeout` scheduling (3-12s random), random frequency (2-8kHz), random stereo pan, exponential decay envelope, routed through Deep Echo
- [x] 4.3 Implement ping node cleanup (disconnect nodes after decay completes)

## 5. Integration and Controls

- [x] 5.1 Wire `setEnabled()` to stop/resume pulsar scheduling and fade master gain
- [x] 5.2 Verify audio toggle button in `App.tsx` works correctly with the new engine
- [x] 5.3 Adjust master gain and individual layer volumes for a balanced, immersive mix
