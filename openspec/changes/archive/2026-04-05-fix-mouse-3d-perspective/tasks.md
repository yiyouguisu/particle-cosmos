## 1. 透视修正工具函数

- [x] 1.1 在 ParticleField.tsx 的 useFrame 回调顶部提取 cameraZ 常量（值为 2），并定义透视缩放因子计算方式：`zScale = (cameraZ - pz) / cameraZ`，对 pz 做 clamp（上限 cameraZ - 0.1）防止数值异常

## 2. 修正鼠标移动交互（引力/斥力）

- [x] 2.1 修正慢速鼠标引力交互（speed < 2 分支）：在内层循环中读取粒子 z，计算 zScale，用 `mouseWorldX * zScale` / `mouseWorldY * zScale` 替代原始 mouseWorldX/Y，交互半径乘以 zScale
- [x] 2.2 修正快速鼠标斥力交互（speed > 5 分支）：同上方式修正距离计算和半径

## 3. 修正点击效果交互

- [x] 3.1 修正冲击波效果（shockwave）：在循环中根据粒子 z 深度修正冲击波中心点坐标和环半径
- [x] 3.2 修正黑洞效果（blackhole）：吸引和爆炸两个阶段的距离判定均应用透视修正

## 4. 修正长按效果交互

- [x] 4.1 修正长按坍缩（gravitational collapse）：根据粒子 z 深度修正长按中心点坐标和坍缩半径
- [x] 4.2 修正长按释放爆炸：同上修正释放爆炸的距离判定

## 5. 修正光链透视问题

- [x] 5.1 修正光链 chase 方向：计算当前编队粒子的平均 z 深度，对 mouseWorldX/Y 做透视修正后作为追踪目标
- [x] 5.2 修正光链 snap-on 判定：收集粒子时根据粒子 z 深度做透视修正距离比较

## 6. 验证

- [x] 5.1 构建项目确认无编译错误，在 harmonics、aizawa、thomas 等高 z 编队下验证鼠标交互响应正常
- [x] 6.1 构建验证光链修复
