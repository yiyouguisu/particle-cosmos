### Requirement: Click effects do not disrupt non-affected particles
Click effects SHALL only affect particles within a defined radius of the click point, leaving particles outside the radius in their normal behavior state.

#### Scenario: Localized effect scope
- **WHEN** a click effect is triggered anywhere in the viewport
- **THEN** only particles within the effect's defined radius are affected, and particles outside this radius continue their normal behavior uninterrupted
