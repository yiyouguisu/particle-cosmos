## MODIFIED Requirements

### Requirement: Visual state gradient
The light chain visual appearance SHALL vary with both `chaseWeight` and the active formation's chain color palette. When chasing, the head and chain SHALL use the formation's chase color gradient. When roaming, they SHALL use the formation's roam color gradient. During morph transitions, colors SHALL blend between the source and target formation palettes using `morphProgress`.

#### Scenario: Chase visual state per formation
- **WHEN** `chaseWeight` is near 1.0 and the active formation is Lorenz
- **THEN** the chain uses the Lorenz formation's chase color gradient (warm amber tones), not a generic gold

#### Scenario: Roam visual state per formation
- **WHEN** `chaseWeight` is near 0.0 and the active formation is Rhodonea
- **THEN** the chain uses the Rhodonea formation's roam color gradient (dark rose tones), not a generic blue

#### Scenario: Morph transition blends chain palettes
- **WHEN** morphing from Fibonacci (green chase palette) to Clifford (orange chase palette) at 50% progress
- **THEN** the chase chain colors are a 50/50 blend of green and orange tones

#### Scenario: Three-way blending
- **WHEN** `chaseWeight` is 0.5 and morph progress is 0.5
- **THEN** the chain color is a blend of: 50% old-formation palette + 50% new-formation palette, with each palette itself being 50% roam + 50% chase colors

## ADDED Requirements

### Requirement: Formation-dependent chain movement parameters
The light chain head movement SHALL be influenced by per-formation behavior parameters: curvature bias (multiplier on the spiral curvature), speed scale (multiplier on head movement speed), and max chain length.

#### Scenario: Curvature bias affects roaming path
- **WHEN** a formation with high curvature bias (e.g., 0.8) is active and the chain is roaming
- **THEN** the chain head traces tighter curves and spirals compared to a formation with low curvature bias (e.g., 0.3)

#### Scenario: Speed scale affects head speed
- **WHEN** a formation with speed scale 1.5 is active
- **THEN** the base head movement speed is 1.5x the default, affecting both roaming and chasing speeds

#### Scenario: Max chain length varies per formation
- **WHEN** a formation defines max chain length of 20
- **THEN** the chain can accumulate up to 20 particles, overriding the default MAX_CHAIN_LENGTH for that formation

#### Scenario: Behavior parameters interpolate during morph
- **WHEN** morphing between two formations with different behavior parameters
- **THEN** the effective curvature bias, speed scale, and max chain length are linearly interpolated using `morphProgress`
