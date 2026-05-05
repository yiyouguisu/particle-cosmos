## Context

本项目是一个基于 React Three Fiber 的粒子可视化应用，包含 10000 个粒子在 16 种数学阵型间变换，配合动态光链、交互效果和 FM 合成音频。项目已完成核心功能开发，typecheck 和 lint 均通过。当前需要在发布前进行最终优化，重点是运行时性能、代码卫生和 UX 细节。

当前架构：
- `ParticleField.tsx`（34KB）：包含所有粒子逻辑的单一大组件，useFrame 回调约 550 行
- `formations.ts`（25KB）：16 种阵型生成器，部分使用轨迹缓存
- `useStore.ts`：Zustand store，存在历史迭代留下的未使用状态
- `globals.css`：包含前一版景观场景的遗留样式

## Goals / Non-Goals

**Goals:**
- 减少 useFrame 中的冗余循环次数，从 5+ 次独立遍历合并为更少的遍历
- 消除每帧的 `new Set()` 分配，减少 GC 压力
- 清理 store 中未使用的状态字段和 action，减小 bundle 和认知负担
- 清理 globals.css 中与当前场景无关的遗留样式
- 用 CSS class 替代 App.tsx 中 audio toggle 的内联样式
- 为 formation name 添加过渡动画

**Non-Goals:**
- 不重构 ParticleField.tsx 的整体架构（如拆分为多个组件或引入 ECS）
- 不新增功能或阵型
- 不改变 WebGL shader 逻辑
- 不引入 Web Worker 或 WASM 做离屏计算（超出本轮范围）
- 不处理移动端适配

## Decisions

### 1. Velocity damping 合并入主循环

**决定**：将独立的 velocity damping 循环（`velocities[i] *= 0.95`，行 408-410）合并到紧邻的粒子位置更新循环中。

**理由**：当前 useFrame 中有独立的 damping 遍历（10000*3 次），紧接在位置更新循环之后。合并后减少一次完整遍历，利用 CPU cache locality。

**替代方案**：保持独立循环更清晰，但 10K*3 的额外迭代成本不可忽略。

### 2. Chain Set 复用策略

**决定**：使用模块级 `Uint8Array(TOTAL_COUNT)` 替代每帧创建的 `new Set(chain)`，在扫描前标记 chain 中的粒子索引，扫描后清除。

**理由**：`new Set(chain)` 每帧分配一个新对象并从数组构建，chain 长度 12-20 时 Set 本身开销不大，但持续的分配会增加 GC 压力。`Uint8Array` 分配一次、复用无 GC。

**替代方案**：用 `chain.includes(idx)` 直接线性搜索——chain 短时 O(n) 可接受，但每帧 200 次 scan 循环中调用 `.includes()` 总计 ~4000 次查找，不如 O(1) 的 typed array 查表。

### 3. Living formation 轨迹缓存——降低更新频率

**决定**：对 clifford、aizawa、thomas、halvorsen、rossler 等基于迭代轨迹的 living formation，将缓存更新频率从每帧降低到每 N 帧（如 ~10 帧一次），中间帧使用 liveTarget 的 lerp 平滑。

**理由**：这些 formation 的参数随 time 缓慢漂移（sin(time*0.03) 级别），相邻帧的轨迹差异极小，但 `computeFormationPositions` 会因 cache key 变化而每帧重算整条 10000 点的轨迹（含 warm-up 迭代）。降频后轨迹更新仍流畅（已有 liveTarget lerp 平滑），但大幅减少计算量。

**替代方案**：固定 time 参数精度（如 `time.toFixed(1)`）来减少 cache miss——但这会导致明显的离散跳变。降频 + lerp 平滑更自然。

### 4. Store 清理策略

**决定**：直接移除 `click`、`mouseTrail` 相关状态、action 和类型。同步移除 `types/index.ts` 中对应的类型定义。

**理由**：这些功能在 ParticleField.tsx 中已完全用 ref 实现（`clickRef`、`longPressRef`），store 版本未被任何组件引用，属于历史遗留。

### 5. Audio toggle 样式迁移

**决定**：将 App.tsx 中 audio toggle 的内联 style 替换为 globals.css 中已有的 `.audio-toggle` class。

**理由**：globals.css 已定义了 `.audio-toggle`，包含 hover 效果和 backdrop-filter，但 App.tsx 中使用了内联样式覆盖了它。统一使用 CSS class 可获得 hover 反馈且更易维护。

### 6. Formation name 过渡动画

**决定**：使用 CSS `transition: opacity` + React state 控制 formation name 在切换时的淡出/淡入效果。

**理由**：当前 formation name 在切换时直接跳变，添加 opacity transition 提升视觉连贯性，实现简单无额外依赖。

## Risks / Trade-offs

- **[循环合并增加代码复杂度]** → 通过注释标记 damping 操作的位置，保持可读性
- **[降低轨迹缓存更新频率可能导致视觉跳变]** → liveTarget 的 lerp 平滑已经在处理这个问题，实际上 10 帧间隔（~167ms@60fps）的参数变化极小
- **[移除 store 状态可能影响未来功能]** → 这些状态已有 ref 替代方案，如需恢复可从 git history 找回
