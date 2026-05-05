### Requirement: Particle system rendering with Points and ShaderMaterial
The system SHALL render 10,000 particles using a single `<points>` element with custom ShaderMaterial, replacing the previous InstancedMesh approach. The system SHALL maintain a target frame rate of 60fps on mid-range hardware. The formation count SHALL be 17.

#### Scenario: Render particle count
- **WHEN** the scene is fully loaded and rendered
- **THEN** 10,000 particles are rendered in a single draw call using Points geometry

#### Scenario: Maintain target frame rate
- **WHEN** the page is viewed on a mid-range desktop device with post-processing enabled
- **THEN** the rendering maintains at least 60fps as measured by browser performance tools

#### Scenario: Pure black background
- **WHEN** the scene is rendered
- **THEN** the background color is pure black (#000000)

### Requirement: Particle position update loop structure
ParticleField 的粒子位置更新循环 SHALL 在单次遍历中完成位置计算和 velocity damping，取代当前分离的两个循环。

#### Scenario: Single loop for position and damping
- **WHEN** useFrame 回调执行非 morphing 状态下的粒子位置更新
- **THEN** 每个粒子的位置赋值和 velocity damping 在同一次循环迭代中完成

#### Scenario: Morphing state loop optimization
- **WHEN** useFrame 回调执行 morphing 状态下的粒子插值
- **THEN** velocity damping 同样在 morphing 循环内完成，不再有独立的 damping 循环
