## MODIFIED Requirements

### Requirement: Click effects do not disrupt non-affected particles
Click effects SHALL only affect particles within a defined radius of the click point, leaving particles outside the radius in their normal behavior state.

#### Scenario: Localized effect scope
- **WHEN** a click effect is triggered anywhere in the viewport
- **THEN** only particles within the effect's defined radius are affected, and particles outside this radius continue their normal behavior uninterrupted

## REMOVED Requirements

### Requirement: Cloud zone click effect - cloud burst
**Reason**: Zone-specific click effects replaced by universal click actions (shockwave, black hole, gravitational collapse).
**Migration**: See `advanced-interactions` spec for new click effects.

### Requirement: Water zone click effect - splash
**Reason**: Zone-specific click effects replaced by universal click actions.
**Migration**: See `advanced-interactions` spec for new click effects.

### Requirement: Dune zone click effect - sand eruption
**Reason**: Zone-specific click effects replaced by universal click actions.
**Migration**: See `advanced-interactions` spec for new click effects.

### Requirement: Starfield zone click effect - supernova
**Reason**: Zone-specific click effects replaced by universal click actions.
**Migration**: See `advanced-interactions` spec for new click effects.
