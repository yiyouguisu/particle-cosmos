## Why

Create an immersive, interactive particle-based nature landscape page that showcases the beauty of natural phenomena through real-time simulation. This provides a visually stunning landing/demo experience that engages users through exploration and discovery rather than passive viewing.

## What Changes

- Add a new full-screen interactive page featuring a particle-based nature landscape
- Implement a sunrise animation on first page load where particles rise from the horizon to form the scene
- Divide the scene into three vertical zones: cloud/wind, ocean/waves, and dunes/terrain, with visual fusion at boundaries
- Add mouse-driven particle interactions unique to each zone (wind push, ripple, dust spray)
- Add click-triggered special effects per zone (cloud burst, splash, sand喷射)
- Add a hidden starfield zone at screen edges discoverable through exploration
- Include synthesized ambient audio (wind, waves, sand sounds) with toggle control
- Display a brief hint toast on first load, then fade to pure exploration mode

## Capabilities

### New Capabilities
- `particle-rendering`: Core particle system rendering using React Three Fiber with instanced mesh, supporting ~7000 particles at 60fps
- `sunrise-animation`: Initial page load animation where particles rise from horizon line to form the complete scene
- `zone-physics`: Distinct physics behaviors per zone (wind drift, wave oscillation, terrain deformation) with smooth boundary blending
- `mouse-interaction`: Real-time mouse-driven particle interactions (push, ripple, spray) with zone-specific responses
- `click-effects`: Zone-specific click-triggered effects (cloud burst, water splash, sand eruption, star nova)
- `starfield-zone`: Hidden interactive starfield at screen edges with twinkle, mouse trail, and nova burst effects
- `ambient-audio`: Synthesized environmental audio (wind, waves, sand) via Web Audio API with toggle control
- `ui-overlay`: Minimal UI overlay including hint toast, audio toggle, and starfield hint icon

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- New React components and scenes under `src/`
- Three independent Three.js canvas instances with boundary blending
- Zustand store for global state (mouse position, audio state, sunrise phase)
- Web Audio API audio synthesis engine (no external audio files)
- Post-processing pipeline (bloom, vignette) via @react-three/postprocessing
- No backend or API changes required
