# Particle Cosmos

Interactive 3D particle visualization with 10,000 particles morphing between 17 mathematical formations, real-time generative audio, and mouse-driven physics.

English | [中文](README_zh.md)

## Features

- **17 formations** — Lorenz, Clifford, Aizawa, Thomas, Rössler, Halvorsen attractors; Möbius, Klein, Trefoil, Cinquefoil knots; Torus, Shell, Helix, Harmonics, Rhodonea surfaces; Diffuse cloud; Milkyway cascade
- **Living motion** — Time-parametrized formations continuously evolve (attractors drift, knots rotate, galaxy shimmers)
- **Magnetic field interaction** — Mouse movement creates tangential swirl (slow) or radial tear (fast), with dwell-strengthening effect
- **Click effects** — Shockwave (single click), blackhole attract-explode (double click), gravitational collapse (long press)
- **Dynamic light chain** — Spiral roaming chain that chases the mouse, with per-formation color gradients
- **Generative audio** — FM drone, resonant noise, sub-bass, random bell events, pentatonic melody — all synthesized in real-time
- **Smooth morphing** — 3.5s staggered easing transitions between formations

## Getting Started

```bash
npm install
npm run dev
```

## Controls

| Input | Action |
|-------|--------|
| Mouse move | Magnetic field — swirl or tear particles |
| Click | Shockwave — expanding ring force |
| Double click | Blackhole — attract then explode |
| Long press (>0.3s) | Gravitational collapse, release to explode |
| Scroll / Arrow keys | Cycle formations |
| Space | Pause auto-cycle |

## Tech Stack

- React + TypeScript
- Three.js (via @react-three/fiber)
- Custom GLSL shaders (particle + line rendering)
- Zustand (state management)
- Web Audio API (generative audio)
- Vite (build tooling)

## Architecture

```
User input → useMouseTracking → Zustand store → ParticleField useFrame loop
  → Formation generators + physics forces → Custom shaders → GPU
  → AudioEngine (independent)
```

## License

MIT
