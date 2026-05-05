### Requirement: Formation library with mathematical shape generators
The system SHALL provide a library of at least five distinct mathematical formations, each implemented as a pure function that computes a 3D position for a given particle index and total count.

#### Scenario: Each formation produces unique positions
- **WHEN** a formation generator is called with index 0 through 9999 and total 10000
- **THEN** each call returns an {x, y, z} position that places particles in the characteristic shape of that formation

#### Scenario: Formations available
- **WHEN** the formation library is queried
- **THEN** it provides at least: Diffuse (random field), Lorenz attractor, Fibonacci/golden spiral, Lissajous curves, and Torus surface generators

### Requirement: Diffuse formation
The Diffuse formation SHALL distribute particles randomly across a rectangular field with slight noise-based drift, serving as the default resting state.

#### Scenario: Random distribution with bounds
- **WHEN** the Diffuse formation is active
- **THEN** particles are distributed across approximately a 6x2 unit area in world space with random Z spread of +-1 unit

### Requirement: Lorenz attractor formation
The Lorenz formation SHALL arrange particles along the trajectory of a Lorenz attractor with parameters sigma=10, rho=28, beta=8/3, producing a butterfly-shaped double spiral.

#### Scenario: Butterfly shape
- **WHEN** the Lorenz formation is computed
- **THEN** particles trace the characteristic two-lobed butterfly shape, scaled to fit within the viewport

### Requirement: Fibonacci spiral formation
The Fibonacci spiral formation SHALL arrange particles in a sunflower/phyllotaxis pattern using the golden angle (137.508 degrees) with radius proportional to the square root of the particle index.

#### Scenario: Phyllotaxis pattern
- **WHEN** the Fibonacci formation is computed
- **THEN** particles form a circular disc with visible spiral arms radiating from the center

### Requirement: Lissajous curve formation
The Lissajous formation SHALL arrange particles along a parametric Lissajous curve with frequency ratio a:b = 3:2 and phase offset delta = pi/2.

#### Scenario: Figure-eight-like pattern
- **WHEN** the Lissajous formation is computed
- **THEN** particles trace a smooth closed curve with visible crossing points, with slight Z variation for depth

### Requirement: Torus surface formation
The Torus formation SHALL arrange particles on the surface of a 3D torus with major radius R and minor radius r, projected with perspective into the viewport.

#### Scenario: Donut shape with depth
- **WHEN** the Torus formation is computed
- **THEN** particles form a recognizable torus (donut) shape with depth variation along the Z axis

### Requirement: Smooth elastic morphing between formations
The system SHALL transition particles from the current formation to the next using elastic eased interpolation, with staggered start times per particle to create a cascade wave effect.

#### Scenario: Morph animation
- **WHEN** a formation switch is triggered
- **THEN** each particle begins moving from its current position toward its new target position with elastic easing over approximately 2-3 seconds

#### Scenario: Staggered cascade
- **WHEN** a morph begins
- **THEN** particles closer to the center of the new formation start moving slightly before particles farther away, creating a visible wave-like cascade

#### Scenario: Continuous micro-motion at target
- **WHEN** particles reach their target positions in any formation
- **THEN** they continue a subtle oscillating micro-motion (breathing) rather than remaining perfectly static

### Requirement: Hybrid formation cycling
The system SHALL auto-cycle through formations on a timer and also allow manual override via user input, with manual actions resetting the auto-timer.

#### Scenario: Auto-cycle timing
- **WHEN** no user interaction occurs for approximately 10 seconds after the last formation switch
- **THEN** the system automatically transitions to the next formation in sequence

#### Scenario: Manual override via keyboard
- **WHEN** the user presses the right arrow key
- **THEN** the system immediately transitions to the next formation and resets the auto-cycle timer

#### Scenario: Manual override via left arrow
- **WHEN** the user presses the left arrow key
- **THEN** the system transitions to the previous formation and resets the auto-cycle timer

#### Scenario: Scroll wheel switching
- **WHEN** the user scrolls the mouse wheel
- **THEN** the system transitions to the next (scroll down) or previous (scroll up) formation and resets the auto-cycle timer

#### Scenario: Pause auto-cycle
- **WHEN** the user presses the Space key
- **THEN** the auto-cycle timer is paused/resumed, indicated by a subtle UI hint

#### Scenario: Cycle wraps around
- **WHEN** the formation index reaches the last formation and advances
- **THEN** it wraps back to the first formation
