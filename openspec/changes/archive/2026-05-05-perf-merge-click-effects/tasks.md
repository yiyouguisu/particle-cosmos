## 1. 合并点击效果循环

- [x] 1.1 在 useFrame 的点击效果区域之前，完成所有效果的时间推进：`clickRef.current.time += delta`、计算 `longPressRef.current` 的 holdTime/releaseElapsed
- [x] 1.2 在循环前预计算每个效果的阶段参数：shockwave 的 baseRingRadius/baseRingWidth/cx/cy；blackhole 的 cosA/sinA（attract 阶段）或 explodeStrength（explode 阶段）；longpress 的 baseRadius/collapseForce 或 release 的 explodeForce/decayFactor
- [x] 1.3 在循环前判断 blackhole 当前阶段（attract: ct<1.0 / explode: 1.0≤ct<1.2 / done: ct≥3），存为变量供循环内分支使用
- [x] 1.4 将 4 个独立的 10,000 次循环合并为单次循环：每个粒子计算一次 zScale，然后按顺序检查 shockwave（ring 力，distSq 阈值 0.0004）、blackhole attract（tangent+radial 力，阈值 0.0004）/ explode（径向力，阈值 0.0001）、longpress collapse（径向力，阈值 0.0004）/ release（径向衰减力，阈值 0.0001）
- [x] 1.5 在循环后更新效果状态：shockwave ct>2 时 `active=false`；blackhole ct>3 时 `active=false`；longpress releaseElapsed≥0.3 时重置 longPressRef
- [ ] 1.6 验证：单击 shockwave、双击 blackhole、长按 collapse/release 的视觉效果与优化前完全一致

## 2. morph store 节流

- [x] 2.1 新增 `morphStoreCounterRef`，在 morph 触发时（`formation.targetIndex !== lastFormationRef.current`）重置为 0
- [x] 2.2 将 `setMorphProgress` 调用改为：每 5 帧（`morphStoreCounterRef.current % 5 === 0`）或 `rawProgress >= 1` 时执行
- [ ] 2.3 验证：morph 动画流畅度不受影响，UI 进度指示器正常工作，快速连续切换编队时 store 状态正确

## 3. chain.shift() 优化

- [x] 3.1 将 `while (chain.length > activeMaxLength) { chain.shift() }` 替换为 `chain.splice(0, chain.length - activeMaxLength)`
- [ ] 3.2 验证：光链行为与优化前一致

## 4. 整体验证

- [x] 4.1 运行 `npm run typecheck` 确保无类型错误
- [x] 4.2 运行 `npm run lint` 确保无 lint 错误
- [ ] 4.3 手动测试所有交互效果：单击 shockwave、双击 blackhole、长按 collapse/release、鼠标移动磁场、编队切换 morph、光链行为
