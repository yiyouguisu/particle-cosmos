## Context

ParticleField.tsx 的 useFrame 循环是整个应用的热路径，每帧处理 10,000 粒子的位置、力场、效果和光链。当前实现中，点击效果（shockwave、blackhole、longpress）各自独立遍历全部粒子，最坏情况每帧 3-4 次全量遍历，每次重复计算相同的 zScale。morph 期间 `setMorphProgress` 每帧触发 Zustand 订阅。光链截断用 `while + shift` 循环。

约束：所有优化必须保证视觉效果完全不变（bit-identical 输出）。

## Goals / Non-Goals

**Goals:**
- 减少 useFrame 每帧的总迭代次数（点击效果从 3-4 次全量遍历降为 1 次）
- 减少 morph 期间不必要的 store 更新
- 保持所有视觉效果完全不变

**Non-Goals:**
- 不改变粒子数量（TOTAL_COUNT = 10000）
- 不改变 shader 或渲染管线
- 不近似 trig 函数（保持 Math.sin/cos 的精度）
- 不优化编队生成器内部逻辑（milkyway 的 trig 调用因 per-particle 参数无法消除）

## Decisions

### 决策 1: 点击效果合并策略 — 单循环多效果评估

**选择**: 将所有点击/交互效果合并为一个 10,000 次循环，每个粒子在单次迭代中评估所有激活的效果。

**替代方案**:
- A) 保持独立循环，但用 early-out 跳过不活跃的效果 → 仍有多次循环开销
- B) 用空间分区（grid）加速距离检查 → 实现复杂，对 10,000 粒子收益不大

**实现要点**:
- 循环前完成所有效果的时间推进（`clickRef.current.time += delta`、`longPressRef.current` 状态更新）
- 循环前预计算每个效果的阶段参数（shockwave: ringRadius/ringWidth; blackhole: cosA/sinA/explodeStrength; longpress: baseRadius/collapseForce/explodeForce）
- 循环前判断 blackhole 阶段（attract: ct<1.0 / explode: ct<1.2 / inactive），循环内根据阶段变量分支
- 每个粒子只计算一次 `zScale = Math.max(MIN_Z_DIST, CAMERA_Z - pz) / CAMERA_Z`
- 按效果类型依次评估，每个效果用各自的 distSq 阈值（0.0004 或 0.0001）和力公式
- 效果结束后在循环外更新状态（`clickRef.current.active = false`、`longPressRef.current` 重置）

### 决策 2: morph store 节流策略

**选择**: 每 5 帧调用一次 `setMorphProgress`，morph 结束时强制更新，新 morph 开始时重置计数器。

**替代方案**:
- A) 只在 0/0.5/1.0 更新 → 中间进度 UI 无法显示
- B) 用 `requestAnimationFrame` 回调中的时间判断 → 实现复杂

**实现要点**:
- 新增 `morphStoreCounterRef`，每帧 +1
- 每 5 帧或 `rawProgress >= 1` 时调用 `setMorphProgress`
- morph 结束时（`rawProgress >= 1`）始终更新，确保状态正确
- 当 `formation.targetIndex !== lastFormationRef.current` 触发新 morph 时，重置 `morphStoreCounterRef.current = 0`，确保新 morph 的第一帧立即更新 store

### 决策 3: chain.shift() 优化

**选择**: 用 `splice` 替代 `while + shift` 循环。

**当前行为**: chain 是 FIFO — `push` 添加到尾部，`shift` 从头部移除。截断时 `while (chain.length > activeMaxLength) { chain.shift() }` 是 O(n) 的多次数组移动。

**优化**: `chain.splice(0, chain.length - activeMaxLength)` 单次操作完成截断。效果完全等价。

## Risks / Trade-offs

- **[风险] 合并循环增加单次迭代复杂度** → 缓解：每个效果有独立的 early-out 条件（distSq 检查），不活跃的效果几乎零开销
- **[权衡] morph store 节流导致 UI 进度更新延迟** → 可接受：5 帧 ≈ 83ms 延迟，用户不可感知
