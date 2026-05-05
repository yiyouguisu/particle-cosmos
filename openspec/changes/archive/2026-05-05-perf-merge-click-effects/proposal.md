## Why

useFrame 主循环中存在多处冗余计算：点击效果（shockwave/blackhole/longpress）各自独立遍历 10,000 粒子，最坏情况每帧 3-4 次全量遍历，每次重复计算相同的 zScale；morph 期间 store 更新过于频繁；光链截断用 O(n) 的 shift 循环。这些优化在保证视觉效果完全不变的前提下减少每帧计算量。

## What Changes

- **合并点击效果循环**: 将 shockwave、blackhole attract/explode、longpress collapse/release 合并为单次 10,000 粒子遍历，每个粒子只计算一次 zScale，根据激活的效果应用相应的力
- **morph store 更新节流**: `setMorphProgress` 从每帧调用改为每 5 帧调用一次，减少 Zustand 订阅触发；新 morph 开始时重置计数器
- **chain.shift() 优化**: 用 `splice(0, excess)` 替代 `while + shift` 循环

## Capabilities

### Modified Capabilities
- `performance-optimization`: 新增 3 条性能优化需求（合并循环、store 节流、chain 操作优化）
- `click-effects`: 点击效果的实现从多个独立循环合并为单次遍历，需求不变（效果范围、力度、时机均不变）

## Impact

- `src/particles/ParticleField.tsx`: 重构点击效果循环（~80 行合并为 ~40 行）、morph store 节流（~3 行）、chain splice 优化（~1 行）
- 无新增依赖
- 视觉效果完全不变
