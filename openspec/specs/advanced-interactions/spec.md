### Requirement: Mouse gravity attraction field
When the mouse is stationary or moving slowly, the system SHALL attract nearby particles toward the cursor position, creating a gravity-like field effect.

#### Scenario: Particles drift toward cursor
- **WHEN** the mouse is stationary or moving slowly (speed < 2) within the viewport
- **THEN** particles within a defined radius are gently attracted toward the cursor position with force inversely proportional to distance

#### Scenario: Attraction does not collapse particles
- **WHEN** particles are attracted toward the cursor
- **THEN** a minimum distance threshold prevents particles from overlapping at the exact cursor position

### Requirement: Fast mouse cutting trail effect
When the mouse moves quickly, the system SHALL push particles away from the path and leave a temporary glowing trail along the mouse trajectory.

#### Scenario: Particles repelled on fast movement
- **WHEN** the mouse moves with speed > 5
- **THEN** particles near the mouse path are pushed outward perpendicular to the movement direction

#### Scenario: Fading trail
- **WHEN** the mouse moves quickly
- **THEN** a luminous trail is visible along the recent mouse path, fading over approximately 0.5 seconds

### Requirement: Mouse proximity color heating
Particles near the mouse cursor SHALL shift their color toward warmer hues (blue -> purple -> red -> white) based on proximity, with the effect fading as the mouse moves away.

#### Scenario: Color shift near cursor
- **WHEN** the mouse is within interaction radius of particles
- **THEN** those particles' colors shift toward white/warm based on proximity, with closest particles appearing white-hot

#### Scenario: Color recovery
- **WHEN** the mouse moves away from previously heated particles
- **THEN** those particles gradually return to their formation's base color over approximately 1 second

### Requirement: Single-click shockwave
When the user single-clicks, an expanding ring shockwave SHALL push particles outward from the click point, with particles bouncing back after the wave passes.

#### Scenario: Expanding ring
- **WHEN** the user single-clicks anywhere in the viewport
- **THEN** a visible ring-shaped shockwave expands outward from the click point at a consistent speed

#### Scenario: Particle displacement and recovery
- **WHEN** the shockwave ring passes through particles
- **THEN** particles are pushed outward along the ring's radius and then elastically return to their target positions over approximately 1-2 seconds

### Requirement: Double-click black hole vortex
When the user double-clicks, a black hole effect SHALL spiral nearby particles inward toward the click point, then explosively release them.

#### Scenario: Spiral inward phase
- **WHEN** the user double-clicks
- **THEN** particles within a large radius begin spiraling inward toward the click point in a vortex pattern over approximately 1 second

#### Scenario: Explosive release phase
- **WHEN** the spiral inward phase completes
- **THEN** all captured particles are violently expelled outward in all directions, then gradually return to their target positions

### Requirement: Long-press gravitational collapse
When the user presses and holds the mouse button, particles SHALL continuously accelerate toward the press point. On release, all accumulated particles explode outward.

#### Scenario: Continuous accumulation
- **WHEN** the user presses and holds the mouse button for more than 300ms
- **THEN** particles within an increasing radius are progressively attracted toward the press point with growing force

#### Scenario: Release explosion
- **WHEN** the user releases the mouse button after a long press
- **THEN** all accumulated particles explode outward from the collapse point with force proportional to the duration of the press

#### Scenario: Visual feedback during hold
- **WHEN** the user is holding the mouse button
- **THEN** particles near the collapse point glow brighter as they compress, providing visual feedback of energy building

### Requirement: Keyboard formation switching
The user SHALL be able to switch formations using keyboard arrow keys and pause auto-cycling with Space.

#### Scenario: Right arrow advances formation
- **WHEN** the user presses the right arrow key
- **THEN** the particle system transitions to the next formation in the library

#### Scenario: Left arrow goes to previous formation
- **WHEN** the user presses the left arrow key
- **THEN** the particle system transitions to the previous formation in the library

#### Scenario: Space toggles auto-cycle
- **WHEN** the user presses the Space key
- **THEN** the auto-cycle timer is toggled between paused and running

### Requirement: Scroll wheel formation switching
The user SHALL be able to switch formations using the mouse scroll wheel.

#### Scenario: Scroll to switch
- **WHEN** the user scrolls the mouse wheel up or down
- **THEN** the particle system transitions to the previous (up) or next (down) formation
