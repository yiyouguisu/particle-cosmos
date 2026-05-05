## ADDED Requirements

### Requirement: Velocity damping integrated into position update loop
ParticleField 的 useFrame 回调中，velocity damping 操作（`velocities[i] *= dampingFactor`）SHALL 在粒子位置更新循环内执行，而非作为独立的遍历循环。

#### Scenario: Damping applied within position update
- **WHEN** useFrame 回调执行粒子位置更新
- **THEN** velocity damping 在同一循环迭代中应用于每个粒子的 velocity 分量，不再存在独立的 damping 遍历循环

### Requirement: Chain membership lookup uses pre-allocated typed array
光链粒子成员查找 SHALL 使用模块级预分配的 `Uint8Array(TOTAL_COUNT)` 进行 O(1) 查找，不再每帧创建 `new Set(chain)`。

#### Scenario: No per-frame Set allocation
- **WHEN** useFrame 回调执行光链粒子采集扫描
- **THEN** 系统使用预分配的 typed array 标记 chain 成员，扫描完成后清除标记，无 `new Set()` 分配

### Requirement: Trajectory-based living formations throttle recomputation
基于迭代轨迹的 living formation（clifford、aizawa、thomas、halvorsen、rossler）的轨迹重算 SHALL 降频执行，中间帧使用已有的 liveTarget lerp 平滑。

#### Scenario: Trajectory recomputation throttled
- **WHEN** 当前 formation 为 clifford/aizawa/thomas/halvorsen/rossler 且处于 living motion 状态
- **THEN** `computeFormationPositions` 的调用频率 SHALL 不超过每 10 帧一次，中间帧继续通过 liveTarget lerp 平滑过渡

#### Scenario: Visual continuity maintained
- **WHEN** 轨迹重算被节流
- **THEN** 粒子运动 SHALL 保持视觉连续性，无明显跳变或卡顿
