## MODIFIED Requirements

### Requirement: Click effects do not disrupt non-affected particles
Click effects SHALL only affect particles within a defined radius of the click point, leaving particles outside the radius in their normal behavior state. 所有点击效果（shockwave、blackhole、longpress）SHALL 在同一次粒子遍历中评估，每个粒子只计算一次 zScale。

#### Scenario: Localized effect scope
- **WHEN** a click effect is triggered anywhere in the viewport
- **THEN** only particles within the effect's defined radius are affected, and particles outside this radius continue their normal behavior uninterrupted

#### Scenario: Single-pass evaluation
- **WHEN** multiple click effects are active simultaneously
- **THEN** all effects SHALL be evaluated in a single loop iteration per particle, with shared zScale computation
