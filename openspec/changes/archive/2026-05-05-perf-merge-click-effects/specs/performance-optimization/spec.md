## ADDED Requirements

### Requirement: Click effects merged into single particle loop
点击效果（shockwave、blackhole attract/explode、longpress collapse/release）SHALL 合并为单次 10,000 粒子遍历，每个粒子在单次迭代中计算一次 zScale 并评估所有激活的效果。

#### Scenario: Single-pass click effect evaluation
- **WHEN** useFrame 回调执行且至少一个点击效果处于激活状态
- **THEN** 系统 SHALL 只遍历粒子数组一次，在每次迭代中依次评估所有激活的效果并累加力到 velocity

#### Scenario: Visual output unchanged
- **WHEN** 点击效果合并后
- **THEN** 每个粒子受到的力 SHALL 与合并前完全相同（bit-identical），包括 zScale 计算、距离判断、力的方向和大小

#### Scenario: Effect timing preserved
- **WHEN** 点击效果合并后
- **THEN** 每个效果的时间推进（delta 累加）SHALL 在循环前完成，效果的阶段判断（blackhole attract/explode、longpress hold/release）SHALL 与优化前一致

### Requirement: morph store update throttled
morph 期间 `setMorphProgress` SHALL 每 5 帧调用一次，而非每帧调用。morph 结束时（progress >= 1）SHALL 强制更新。新 morph 开始时 SHALL 重置节流计数器。

#### Scenario: Throttled updates during morph
- **WHEN** 编队 morph 正在进行中
- **THEN** `setMorphProgress` SHALL 每 5 帧调用一次（第 0、5、10、15... 帧），中间帧不调用

#### Scenario: Final update on morph completion
- **WHEN** morph 进度达到 1.0
- **THEN** `setMorphProgress(1.0)` SHALL 被调用，无论节流计数器状态

#### Scenario: Counter reset on new morph
- **WHEN** 新的 morph 开始（`formation.targetIndex` 变化）
- **THEN** 节流计数器 SHALL 重置为 0，确保新 morph 的第一帧立即更新 store

### Requirement: chain truncation uses splice
光链截断 SHALL 使用 `splice` 替代 `while + shift` 循环，将 O(n) 的多次数组移动降为单次操作。

#### Scenario: Chain truncated efficiently
- **WHEN** chain 长度超过 `activeMaxLength`
- **THEN** 系统 SHALL 使用 `chain.splice(0, chain.length - activeMaxLength)` 截断，而非循环调用 `shift()`
