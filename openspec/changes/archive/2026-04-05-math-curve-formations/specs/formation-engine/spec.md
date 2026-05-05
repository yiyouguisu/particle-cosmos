## MODIFIED Requirements

### Requirement: Formation library with mathematical shape generators
The system SHALL provide a library of at least eight distinct mathematical formations, each implemented as a pure function that computes a 3D position for a given particle index and total count.

#### Scenario: Each formation produces unique positions
- **WHEN** a formation generator is called with index 0 through 9999 and total 10000
- **THEN** each call returns an {x, y, z} position that places particles in the characteristic shape of that formation

#### Scenario: Formations available
- **WHEN** the formation library is queried
- **THEN** it provides at least: Diffuse (random field), Lorenz attractor, Fibonacci/golden spiral, Lissajous curves, Torus surface, Rose Curve (Rhodonea), Trefoil Knot, and Clifford Attractor generators

### Requirement: Hybrid formation cycling
The system SHALL auto-cycle through all eight formations on a timer and also allow manual override via user input, with manual actions resetting the auto-timer.

#### Scenario: Auto-cycle timing
- **WHEN** no user interaction occurs for approximately 10 seconds after the last formation switch
- **THEN** the system automatically transitions to the next formation in the eight-formation sequence

#### Scenario: Manual override via keyboard
- **WHEN** the user presses the right arrow key
- **THEN** the system immediately transitions to the next formation in the eight-formation cycle and resets the auto-cycle timer

#### Scenario: Manual override via left arrow
- **WHEN** the user presses the left arrow key
- **THEN** the system transitions to the previous formation in the eight-formation cycle and resets the auto-cycle timer

#### Scenario: Scroll wheel switching
- **WHEN** the user scrolls the mouse wheel
- **THEN** the system transitions to the next (scroll down) or previous (scroll up) formation and resets the auto-cycle timer

#### Scenario: Pause auto-cycle
- **WHEN** the user presses the Space key
- **THEN** the auto-cycle timer is paused/resumed, indicated by a subtle UI hint

#### Scenario: Cycle wraps around
- **WHEN** the formation index reaches the last of the eight formations and advances
- **THEN** it wraps back to the first formation

## ADDED Requirements

### Requirement: Post-morph living motion for supported formations
The system SHALL support a living motion mode that activates after morph completion (morphProgress >= 1) for formations that define time-dependent parameter evolution. Living motion continuously recomputes target positions based on elapsed time.

#### Scenario: Living motion activates after morph
- **WHEN** a morph to a living-motion-capable formation completes (morphProgress reaches 1)
- **THEN** the system begins recomputing target positions each frame using the formation's time-dependent generator

#### Scenario: Living motion deactivates during morph
- **WHEN** a new morph begins while living motion is active
- **THEN** living motion stops and the standard morph interpolation takes over using current particle positions as the source

#### Scenario: Formations without living motion
- **WHEN** the morph to a formation without living motion completes (e.g., diffuse, fibonacci)
- **THEN** the system uses the existing micro-motion breathing behavior without recomputing target positions
