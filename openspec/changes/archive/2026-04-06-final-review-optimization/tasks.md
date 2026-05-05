## 1. 性能优化 - ParticleField 循环合并

- [x] 1.1 将 velocity damping 循环（行 408-410）合并到非 morphing 状态的粒子位置更新循环中（行 397-404），在每个粒子的位置赋值后执行 `velocities[i3] *= 0.95; velocities[i3+1] *= 0.95; velocities[i3+2] *= 0.95`
- [x] 1.2 将 velocity damping 同样合并到 morphing 状态的循环中（行 358-366），删除独立的 damping 循环

## 2. 性能优化 - Chain Set 复用

- [x] 2.1 在 ParticleField.tsx 模块顶层添加 `const chainMemberFlags = new Uint8Array(TOTAL_COUNT)` 预分配查找表
- [x] 2.2 将 `const chainSet = new Set(chain)` 替换为：扫描前遍历 chain 标记 `chainMemberFlags[idx] = 1`，扫描中使用 `chainMemberFlags[idx]` 判断，扫描后清除标记
- [x] 2.3 移除 `chainSet.has(idx)` 调用，替换为 `chainMemberFlags[idx]` 检查

## 3. 性能优化 - Living formation 轨迹缓存节流

- [x] 3.1 在 ParticleField 组件中添加 `throttleCounterRef = useRef(0)` 用于追踪帧计数
- [x] 3.2 在 living motion 代码块中，仅当 `throttleCounterRef.current % 10 === 0` 时调用 `computeFormationPositions`，其余帧跳过轨迹重算，仅执行 liveTarget lerp
- [x] 3.3 验证视觉平滑度——确认降频后的 lerp 过渡无明显跳变

## 4. 代码清理 - Store 状态

- [x] 4.1 从 `useStore.ts` 中移除 `click` 状态及初始值
- [x] 4.2 从 `useStore.ts` 中移除 `mouseTrail` 状态及初始值
- [x] 4.3 从 `useStore.ts` 中移除 action：`triggerClick`、`clearClick`、`setClickHoldDuration`、`addTrailPoint`、`pruneTrail`
- [x] 4.4 从 `AppState` 接口中移除对应的类型声明
- [x] 4.5 从 `types/index.ts` 中移除 `ClickInteraction`、`ClickEffectType`、`MouseTrailPoint` 类型（确认无其他文件引用）
- [x] 4.6 从 `useStore.ts` 的 import 中移除不再需要的类型导入

## 5. 代码清理 - CSS 遗留样式

- [x] 5.1 从 `globals.css` 中移除 `.zone-canvas` 及其子选择器样式
- [x] 5.2 从 `globals.css` 中移除 `#cloud-zone`、`#water-zone`、`#dune-zone`、`#starfield-zone` 样式
- [x] 5.3 从 `globals.css` 中移除 `.zone-boundary`、`#cloud-water-boundary`、`#water-dune-boundary` 样式
- [x] 5.4 从 `globals.css` 中移除 `.ui-overlay` 样式
- [x] 5.5 从 `globals.css` 中移除 `.sunrise-overlay`、`.horizon-glow` 样式

## 6. UX 改进 - Audio toggle 样式

- [x] 6.1 将 App.tsx 中 audio toggle 按钮的内联 style 替换为 `className="audio-toggle"`
- [x] 6.2 确认 `.audio-toggle` CSS class 包含必要的 z-index 和定位样式，不需额外内联覆盖

## 7. UX 改进 - Formation name 过渡动画

- [x] 7.1 在 App.tsx 中添加 formation name 的 opacity state，在 formation 切换时触发淡出
- [x] 7.2 为 formation name 的容器 div 添加 CSS transition（`transition: opacity 0.4s ease`）
- [x] 7.3 在 morphProgress 回到 1 或新名称就绪时触发淡入

## 8. 验证

- [x] 8.1 运行 `npm run typecheck` 确认类型检查通过
- [x] 8.2 运行 `npm run lint` 确认 ESLint 检查通过
- [x] 8.3 运行 `npm run build` 确认构建成功
