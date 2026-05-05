## MODIFIED Requirements

### Requirement: Formation library with mathematical shape generators
The system SHALL provide a library of at least five distinct mathematical formations, each implemented as a pure function that computes a 3D position for a given particle index and total count. The library SHALL include the milkyway cascade formation as the 17th formation.

#### Scenario: Each formation produces unique positions
- **WHEN** a formation generator is called with index 0 through 9999 and total 10000
- **THEN** each call returns an {x, y, z} position that places particles in the characteristic shape of that formation

#### Scenario: Formations available
- **WHEN** the formation library is queried
- **THEN** it provides at least: Diffuse (random field), Lorenz attractor, Fibonacci/golden spiral, Lissajous curves, Torus surface generators, and the Milkyway cascade formation

### Requirement: Hybrid formation cycling
The system SHALL auto-cycle through formations on a timer and also allow manual override via user input, with manual actions resetting the auto-timer. The formation count SHALL be 17.

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
- **WHEN** the formation index reaches the last formation (17th) and advances
- **THEN** it wraps back to the first formation
