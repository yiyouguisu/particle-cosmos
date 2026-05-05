# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Production build → dist/
npm run typecheck  # TypeScript type checking (tsc -b)
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test framework is configured.

## Architecture

This is an interactive 3D particle visualization app with 10,000 particles morphing between 17 mathematical/geometric formations, ambient generative audio, and mouse-driven physics interactions.

### Core Data Flow

```
User input (mouse/keyboard/touch)
  → useMouseTracking (smoothed) → Zustand store (mouse state)
  → ParticleField useFrame loop reads store each frame
  → Positions computed from formation generators + physics forces
  → Custom GLSL shaders render particles + light chain
  → AudioEngine reacts to interactions independently
```

### Key Modules

- **`src/particles/formations.ts`** — All 17 formation generators (Lorenz, Clifford, Aizawa, Thomas, Rössler, Halvorsen attractors; Möbius, Klein, Trefoil, Cinquefoil, Torus, Shell, Helix, Harmonics, Rhodonea, Diffuse, Milkyway). Each is a function `(index, total, time?) → {x, y, z}`. Chaotic attractors pre-compute trajectories with caching; time-parametrized formations support "living motion". Also contains per-formation color palettes and light chain configs.

- **`src/particles/ParticleField.tsx`** — The rendering engine. A single `useFrame` loop handles: formation morphing (staggered easing), living motion recomputation (throttled for most, per-frame for milkyway), magnetic field forces (tangential rotation at low speed, radial repulsion at high speed), click/longpress effects (shockwave, blackhole, gravitational collapse), and the dynamic light chain (spiral roam + mouse chase). Custom vertex/fragment shaders for particles and lines. 10,000 particles, additive blending.

- **`src/store/useStore.ts`** — Zustand store. Mouse state (position, velocity, long-press), formation state (current/target index, morph progress, pause), audio toggle. Formation transitions set `targetIndex` + `morphProgress: 0`; the render loop drives morph progress to 1.

- **`src/audio/AudioEngine.ts`** — Web Audio API singleton. FM drone (3 voices × 3 detuned carriers), resonant noise texture (bandpass-filtered white noise), sub-bass triangle wave, random FM bell events, pentatonic phrase-based melody. All synthesized in real-time, no samples.

- **`src/hooks/useMouseTracking.ts`** — Smoothed mouse tracking with lerp factor 0.3 via `requestAnimationFrame`.

### Shader System

Particles use custom `ShaderMaterial` (not PointsMaterial). Vertex shader handles size pulsation, color mixing via morph progress, and depth-based point sizing. Fragment shader renders Gaussian falloff with bright core. The light chain uses separate line shaders with per-vertex opacity and color.

### Interaction Model

- **Single click**: Shockwave (expanding ring force)
- **Double click**: Blackhole (attract → explode)
- **Long press (>0.3s)**: Gravitational collapse → release explosion
- **Mouse movement**: Magnetic field — low speed = tangential swirl + dwell strengthening, high speed = radial tear. Force is perspective-corrected to particle z-depth.
- **Scroll / Arrow keys**: Cycle formations (3.5s morph with staggered easing)
- **Space**: Pause auto-cycle (10s interval)

### Path Alias

`@/` maps to `src/` (configured in both vite.config.ts and tsconfig).

### Performance Notes

- `TOTAL_COUNT = 10000` — particle count is a compile-time constant
- Chaotic attractor trajectories are cached and only recomputed when parameters drift
- Living motion recomputation is throttled to every 10 frames (except milkyway which is per-frame)
- Chain member velocity amplification is capped to prevent chain destabilization
- `dpr` is clamped to `[1, 2]`, antialias disabled, `powerPreference: 'high-performance'`
