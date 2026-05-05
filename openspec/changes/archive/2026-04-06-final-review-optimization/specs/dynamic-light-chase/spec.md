## MODIFIED Requirements

### Requirement: Chain membership lookup efficiency
光链系统在粒子采集扫描中的成员查找 SHALL 使用 O(1) 时间复杂度的查找结构，且该结构不在每帧重新分配。

#### Scenario: Pre-allocated lookup structure
- **WHEN** useFrame 回调执行光链粒子采集
- **THEN** 使用模块级预分配的 `Uint8Array` 作为查找表，采集前标记、采集后清除

#### Scenario: No per-frame heap allocation for chain lookup
- **WHEN** 光链系统运行
- **THEN** 不存在每帧的 `new Set()` 或其他堆分配用于链成员查找
