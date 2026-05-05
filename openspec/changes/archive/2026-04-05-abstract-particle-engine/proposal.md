## Why

The current particle landscape renders 10,000 particles with basic solid-color circles, NormalBlending, and a simple flow-field drift. The installed `@react-three/postprocessing` package is unused, four zone scenes (Cloud, Water, Sand, Starfield) are written but never rendered, and the shader lacks glow or soft edges. The result is visually flat. The goal is to transform this into an **abstract particle art engine** where particles morph between mathematical formations (Lorenz attractor, golden spiral, Lissajous curves, torus), feature rich interactions (gravity fields, shockwaves, black-hole collapse), and are rendered with Bloom post-processing and HDR glow shaders on a pure black background.

## What Changes

- **Replace zone-based scene architecture** with a single formation-morphing engine that drives all 10K particles through a library of mathematical shapes.
- **Upgrade the particle shader** from hard-edged flat circles to soft Gaussian falloff with HDR core brightness for Bloom pickup.
- **Switch blending to Additive** so overlapping particles create brighter spots instead of occluding.
- **Add post-processing pipeline**: Bloom, Chromatic Aberration, Vignette, and film Noise via `@react-three/postprocessing`.
- **Implement formation library**: Diffuse (random), Lorenz attractor, Fibonacci/golden spiral, Lissajous curves, Torus surface.
- **Add hybrid formation switching**: auto-cycle every ~10s with manual override via keyboard arrows, scroll wheel, or click.
- **Enhance mouse interaction**: gravity-attract on hover, cutting trail on fast movement, color heating near cursor.
- **Enhance click interaction**: single-click shockwave, double-click black-hole vortex, long-press gravitational collapse with release explosion.
- **Add per-formation color themes** with smooth transitions during morph, computed in the shader via uniforms.
- **Upgrade the light chain** with gradient coloring (cool tail to hot head) and brightness for Bloom.
- **Remove unused zone scenes** (CloudScene, WaterScene, SandScene, StarfieldScene) and related modules (ParticleData, ParticleRenderer, physics, sunrise, colors) that are superseded by the new engine.

## Capabilities

### New Capabilities
- `formation-engine`: Core morphing system that manages a library of mathematical formations, calculates target positions per particle, and drives elastic-eased transitions between shapes with auto-cycle and manual switching.
- `post-processing`: Bloom, Chromatic Aberration, Vignette, and Noise post-processing pipeline using `@react-three/postprocessing`.
- `advanced-interactions`: Enhanced mouse (gravity, trail, color heating) and click (shockwave, black-hole, collapse) interaction system with keyboard/scroll formation switching.
- `glow-shader`: HDR particle shader with Gaussian soft edges, core overbright, additive blending, size pulsation, and per-formation color themes.

### Modified Capabilities
- `particle-rendering`: **BREAKING** - Replaces InstancedMesh approach with Points+ShaderMaterial; removes ParticleRenderer, ParticleData, colors modules.
- `mouse-interaction`: Requirements change to support gravity attract, speed-based cutting trail, and proximity color heating instead of simple repulsion.
- `click-effects`: Requirements change from zone-specific effects to universal shockwave, black-hole vortex, and gravitational collapse.

## Impact

- **Code removal**: `src/scenes/*`, `src/particles/ParticleData.ts`, `src/particles/ParticleRenderer.tsx`, `src/particles/physics.ts`, `src/particles/sunrise.ts`, `src/particles/colors.ts` are all removed.
- **Major rewrites**: `src/particles/ParticleField.tsx` (complete rewrite as formation engine), `src/App.tsx` (add post-processing, keyboard listeners).
- **Store changes**: `src/store/useStore.ts` and `src/types/index.ts` gain formation and interaction state.
- **Hook changes**: `src/hooks/useMouseTracking.ts` adds double-click and long-press detection.
- **New file**: `src/particles/formations.ts` (mathematical formation generators).
- **Dependencies**: No new npm packages needed; `@react-three/postprocessing` is already installed.
