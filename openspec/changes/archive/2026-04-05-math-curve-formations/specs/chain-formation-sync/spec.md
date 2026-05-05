## ADDED Requirements

### Requirement: Per-formation light chain color palettes
Each formation SHALL define dedicated color palettes for the light chain in both roaming and chasing states. The chain colors SHALL harmonize with the formation's particle color palette.

#### Scenario: Chain colors match formation identity
- **WHEN** the Rhodonea formation is active and the chain is roaming
- **THEN** the chain uses dark rose-to-deep pink gradient (tail to head) instead of the default blue

#### Scenario: Chain colors match formation identity during chase
- **WHEN** the Lorenz formation is active and the chain is chasing the mouse
- **THEN** the chain uses bright gold-to-white-orange gradient instead of the generic gold

#### Scenario: All formations define chain palettes
- **WHEN** any formation is active
- **THEN** the light chain uses that formation's specific roam and chase color gradients, never falling back to hardcoded defaults

### Requirement: Light chain color transition during morph
The light chain colors SHALL transition smoothly between the old formation's palette and the new formation's palette during morph, using the same `morphProgress` value that drives particle transitions.

#### Scenario: Synchronized color transition
- **WHEN** a morph is in progress at 50% completion
- **THEN** the chain colors are a 50/50 blend of the source formation's chain palette and the target formation's chain palette

#### Scenario: Transition matches particle timing
- **WHEN** a morph completes
- **THEN** chain colors arrive at the target formation's palette at the same moment particles reach their target positions

### Requirement: Per-formation light chain behavior parameters
Each formation SHALL define behavior parameters that influence how the light chain head moves: curvature bias (how curvy the path), speed scale (how fast the head moves), and maximum chain length.

#### Scenario: Chaotic formations have tighter curvature
- **WHEN** the Clifford Attractor formation is active
- **THEN** the chain head moves with higher curvature bias (tighter spirals) and faster speed compared to the diffuse formation

#### Scenario: Harmonic formations have flowing movement
- **WHEN** the Lissajous formation is active
- **THEN** the chain head moves with moderate curvature and steady speed, producing smooth flowing paths

#### Scenario: 3D formations use longer chains
- **WHEN** the Trefoil Knot formation is active
- **THEN** the maximum chain length is longer than for flat formations, emphasizing the 3D trajectory

### Requirement: Light chain behavior transition during morph
The light chain behavior parameters SHALL transition smoothly between formations during morph, using the same `morphProgress` value.

#### Scenario: Speed transition
- **WHEN** morphing from a slow-chain formation to a fast-chain formation at 50% progress
- **THEN** the chain head speed scale is the midpoint between the two formations' speed scales

#### Scenario: Max length transition
- **WHEN** morphing from a short-chain formation (length 12) to a long-chain formation (length 18)
- **THEN** the effective max chain length smoothly increases during the morph, with excess chain nodes naturally falling off or accumulating as the limit changes
