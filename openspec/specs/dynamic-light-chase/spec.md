### Requirement: Free-floating light chain head
The light chain head SHALL be a free-floating point that moves continuously through the particle field, independent of particle positions. The head SHALL NOT be locked to particle-to-particle interpolation.

#### Scenario: Head moves through empty space
- **WHEN** the light chain head moves through a region with no nearby particles
- **THEN** the head continues moving smoothly without stalling or resetting

### Requirement: Mouse chase behavior
The light chain head SHALL chase the mouse position when the mouse is moving. The chase intensity SHALL be proportional to mouse speed, blended via a smooth `chaseWeight` factor (0 to 1).

#### Scenario: Fast mouse triggers strong chase
- **WHEN** the mouse moves with speed above the high threshold (~8)
- **THEN** `chaseWeight` approaches 1.0, and the head direction is dominated by the vector toward the mouse position

#### Scenario: Slow mouse triggers weak chase
- **WHEN** the mouse moves with speed between the low threshold (~1) and the high threshold (~8)
- **THEN** `chaseWeight` is between 0 and 1, blending chase direction with roam direction

#### Scenario: Stationary mouse triggers no chase
- **WHEN** the mouse speed is below the low threshold (~1)
- **THEN** `chaseWeight` approaches 0.0, and the head direction is fully determined by roaming behavior

### Requirement: Spiral-explorer roaming behavior
When the mouse is stationary, the light chain head SHALL roam freely using a combined spiral and explorer strategy. The spiral component SHALL produce smooth curving motion driven by a time-varying curvature. The explorer component SHALL bias the head away from recent chain node positions to favor unvisited areas.

#### Scenario: Smooth curving roam path
- **WHEN** the mouse is stationary for several seconds
- **THEN** the head traces smooth arcs and spirals, not jagged random turns

#### Scenario: Avoids recently visited areas
- **WHEN** the head approaches positions near its recent chain nodes
- **THEN** the head direction is biased away from those nodes, encouraging exploration of new regions

### Requirement: Direction inertia
The head direction SHALL have inertia, blending the previous frame's direction with the new target direction. This ensures smooth transitions between chase and roam states without abrupt directional changes.

#### Scenario: Chase to roam transition
- **WHEN** the mouse stops moving after fast movement
- **THEN** the head continues in the chase direction momentarily, then gradually transitions to roaming behavior over multiple frames

#### Scenario: Roam to chase transition
- **WHEN** the mouse starts moving after a stationary period
- **THEN** the head smoothly curves toward the mouse direction rather than snapping instantly

### Requirement: Particle snap-on collection
As the head moves through the particle field, it SHALL scan for nearby particles within a snap radius (~0.15-0.3). The nearest non-chain particle within this radius SHALL be added to the chain tail. The chain length SHALL remain capped at MAX_CHAIN_LENGTH.

#### Scenario: Particle collected as head passes
- **WHEN** the head moves within snap radius of a particle not already in the chain
- **THEN** that particle is appended to the chain and the oldest particle is dropped if the chain exceeds max length

#### Scenario: No particle in range
- **WHEN** the head moves through an area with no particles within snap radius
- **THEN** the chain retains its current nodes and the head continues moving without adding new nodes

### Requirement: Speed modulation
The head movement speed SHALL vary based on chase weight. When chasing, the head SHALL move faster. When roaming, the head SHALL move slower.

#### Scenario: Chase speed
- **WHEN** `chaseWeight` is near 1.0
- **THEN** the head speed is approximately 2.5x the base rate

#### Scenario: Roam speed
- **WHEN** `chaseWeight` is near 0.0
- **THEN** the head speed is approximately 0.8x the base rate

### Requirement: Visual state gradient
The light chain visual appearance SHALL vary with `chaseWeight`. When chasing, the head and chain SHALL appear brighter, warmer (gold tones), and more opaque. When roaming, they SHALL appear softer, cooler (blue tones), and more translucent.

#### Scenario: Chase visual state
- **WHEN** `chaseWeight` is near 1.0
- **THEN** the chain head color is warm gold (#ffcc44 range), tail is deep orange, and opacity is high

#### Scenario: Roam visual state
- **WHEN** `chaseWeight` is near 0.0
- **THEN** the chain head color is cool blue (#4466ff range), tail is deep purple, and opacity is softer

### Requirement: Soft boundary containment
The head SHALL be softly contained within the visible viewport. When the head approaches the viewport edge (beyond 90% of half-width/height), a gentle centripetal force SHALL steer it back toward the center, avoiding hard reflections.

#### Scenario: Head near viewport edge
- **WHEN** the head position exceeds 90% of the viewport boundary
- **THEN** an increasing directional bias toward the viewport center is applied, smoothly curving the head back inward

### Requirement: Chain membership lookup efficiency
光链系统在粒子采集扫描中的成员查找 SHALL 使用 O(1) 时间复杂度的查找结构，且该结构不在每帧重新分配。

#### Scenario: Pre-allocated lookup structure
- **WHEN** useFrame 回调执行光链粒子采集
- **THEN** 使用模块级预分配的 `Uint8Array` 作为查找表，采集前标记、采集后清除

#### Scenario: No per-frame heap allocation for chain lookup
- **WHEN** 光链系统运行
- **THEN** 不存在每帧的 `new Set()` 或其他堆分配用于链成员查找
