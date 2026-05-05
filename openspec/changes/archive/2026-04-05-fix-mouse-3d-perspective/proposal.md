## Why

3D 编队（如 harmonics、aizawa、thomas 等）下鼠标交互几乎失灵。原因是鼠标坐标被投射到 z=0 平面后直接与粒子世界坐标做 XY 距离比较，完全忽略了透视投影对不同 z 深度粒子的位置偏移。z 值越大的编队，屏幕上粒子的可见位置与交互判定位置的偏差越大，导致用户明明"摸到"了粒子却没有任何响应。

## What Changes

- 修正鼠标交互的距离计算逻辑，加入粒子 z 深度的透视修正，使鼠标在屏幕空间中准确命中粒子
- 交互半径随 z 深度缩放，保证在屏幕空间中交互范围一致
- 同时修正所有基于鼠标世界坐标的交互判定（引力/斥力、冲击波、黑洞、长按坍缩）

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `mouse-interaction`: 鼠标世界坐标需根据粒子 z 深度做透视修正，交互半径随深度缩放，确保所有 3D 编队下交互行为一致

## Impact

- `src/particles/ParticleField.tsx`: 修改 useFrame 中所有鼠标距离计算逻辑（引力、斥力、冲击波、黑洞、长按坍缩/释放）
- 不涉及新依赖、不涉及 API 变更、不涉及 store 结构变化
