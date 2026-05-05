## Why

项目已完成核心功能开发，经过全面代码审查发现若干可优化的问题：性能热点（10000 粒子逐个遍历的多重循环、living formation 每帧重算整条轨迹缓存）、代码质量问题（store 中存在未使用的状态和 action、globals.css 中遗留大量与当前粒子场景无关的样式）、以及用户体验细节（audio toggle 按钮缺少 hover 反馈、缺少移动端触控适配提示）。在正式发布前统一处理这些问题可以显著提升运行帧率、减少包体积、改善代码可维护性。

## What Changes

- **性能优化**：减少 `useFrame` 中的冗余循环——将 velocity damping 合并到粒子位置更新循环中，避免额外的 `TOTAL_COUNT * 3` 次遍历
- **性能优化**：light chain 的 `new Set(chain)` 每帧都创建新 Set 对象，改为复用或使用 typed array 标记
- **性能优化**：living formation（如 clifford、aizawa、thomas 等）的轨迹缓存策略——当参数因 time 变化而失效时每帧重算整条轨迹（10000 个点），需引入增量更新或降低更新频率
- **代码清理**：移除 store 中未使用的 `click`、`mouseTrail` 相关状态和 action（`triggerClick`、`clearClick`、`setClickHoldDuration`、`addTrailPoint`、`pruneTrail`），这些功能已在组件层用 ref 实现
- **代码清理**：移除 globals.css 中与当前场景无关的遗留样式（zone-canvas、zone-boundary、sunrise-overlay、horizon-glow 等）
- **UX 改进**：audio toggle 按钮使用 CSS class 替代内联样式，利用 globals.css 中已有的 `.audio-toggle` 样式（含 hover 效果和 backdrop-filter）
- **UX 改进**：formation name 显示添加切换时的淡入淡出过渡动画

## Capabilities

### New Capabilities

- `performance-optimization`: 覆盖 useFrame 循环合并、Set 复用、轨迹缓存策略优化
- `code-cleanup`: 覆盖 store 未使用状态清理和 CSS 遗留样式清理
- `ux-polish`: 覆盖 audio toggle 样式改进和 formation name 过渡动画

### Modified Capabilities

- `particle-rendering`: 修改粒子渲染循环结构，将 velocity damping 合并进主循环
- `dynamic-light-chase`: 修改 chain Set 创建策略为复用方式

## Impact

- **受影响文件**：`ParticleField.tsx`（循环合并、Set 复用、轨迹缓存）、`useStore.ts`（移除未使用状态）、`types/index.ts`（移除未使用类型）、`globals.css`（清理遗留样式）、`App.tsx`（使用 CSS class、添加过渡动画）
- **依赖**：无新增依赖
- **风险**：均为内部重构，不改变外部可见行为，回归测试关注帧率和视觉一致性
