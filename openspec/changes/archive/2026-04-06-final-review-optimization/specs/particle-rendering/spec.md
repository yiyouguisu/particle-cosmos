## MODIFIED Requirements

### Requirement: Particle position update loop structure
ParticleField 的粒子位置更新循环 SHALL 在单次遍历中完成位置计算和 velocity damping，取代当前分离的两个循环。

#### Scenario: Single loop for position and damping
- **WHEN** useFrame 回调执行非 morphing 状态下的粒子位置更新
- **THEN** 每个粒子的位置赋值和 velocity damping 在同一次循环迭代中完成

#### Scenario: Morphing state loop optimization
- **WHEN** useFrame 回调执行 morphing 状态下的粒子插值
- **THEN** velocity damping 同样在 morphing 循环内完成，不再有独立的 damping 循环
