## 1. 新增状态 Refs

- [x] 1.1 在 ParticleField 组件中新增 `dwellTimeRef` (number, 初始 0)、`prevMouseWorldRef` (用于计算帧间鼠标速度方向向量)
- [x] 1.2 在 useFrame 回调顶部计算当前帧鼠标速度方向 `mouseVelX/Y`（当前鼠标世界坐标 - 上一帧鼠标世界坐标），并更新 `prevMouseWorldRef`

## 2. 替换鼠标交互力场

- [x] 2.1 移除现有的慢速吸引代码块（原 `if (mouse.speed < 2)` 分支，约行 432-448）
- [x] 2.2 移除现有的快速排斥代码块（原 `else if (mouse.speed > 5)` 分支，约行 453-474）
- [x] 2.3 实现磁场涡旋力场：对每个粒子计算径向矢量 r⃗、切向矢量 t⃗ = (-r̂.y, r̂.x)、叉积符号 sign(mouseVelX * ry - mouseVelY * rx) 决定旋转方向
- [x] 2.4 实现连续速度过渡：用 smoothstep 在速度 [1, 6] 范围插值径向系数（从吸引到排斥）和切向系数
- [x] 2.5 实现平方反比衰减：力 ∝ 1 / max(distSq, 0.01)，保留最大半径 early-out 优化

## 3. 停留增强效应

- [x] 3.1 在 useFrame 中更新 dwellTime：speed < 1 时 += delta，speed > 2 时 *= 0.9 快速衰减
- [x] 3.2 计算 strengthMultiplier = 1 + smoothstep(dwellTime, 0, 4) * 2，应用于切向和径向力

## 4. 验证与调优

- [x] 4.1 运行 typecheck 和 lint 确保无编译错误
- [ ] 4.2 在浏览器中验证：慢速移动鼠标产生向内螺旋涡旋效果
- [ ] 4.3 在浏览器中验证：快速划过产生向外旋转散开效果
- [ ] 4.4 在浏览器中验证：鼠标停留数秒后涡旋逐渐增强
- [ ] 4.5 验证不影响编队切换、点击效果、光链系统等现有功能
- [ ] 4.6 根据视觉效果调优力场系数（切向/径向比例、衰减速率、停留增强曲线）
