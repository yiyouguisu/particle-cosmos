## Why

现有 16 种编队都是数学曲面/吸引子的静态或微变形态，缺少一种具有明确"流动方向"的动态编队。天河倾泻（milkyway cascade）通过粒子沿路径持续流动——从宽阔的银河弧段汇聚收束、再加速倾泻坠落——创造出具有东方古典意象的瀑布式星河效果，为编队列表增加一种全新的动态视觉类型。

## What Changes

- **新增 `milkyway` 编队**: 三段式路径（天河弧 → 汇聚口 → 倾泻散落），粒子通过 `(index + time * flowSpeed) % 1.0` 实现沿路径的持续循环流动
- **Living motion 支持**: 粒子在弧段慢速飘动，进入汇聚口加速，倾泻段最快；路径宽度从宽河面收束到窄峡口再散开
- **编队数量从 16 增加到 17**: 需要更新 `FORMATION_COUNT`、`FORMATION_NAMES`、`FORMATION_COLORS`、`FORMATION_CHAIN_CONFIG`、`LIVING_MOTION` 等注册表
- **配套银蓝色调**: 银白 + 淡蓝的渐变色彩方案

## Capabilities

### New Capabilities
- `milkyway-formation`: 天河倾泻编队的完整定义，包括三段式路径参数曲线、变速流动、宽度变化和循环机制

### Modified Capabilities
- `particle-rendering`: 编队总数从 16 变为 17，需要更新 `FORMATION_COUNT`
- `formation-engine`: 新增 milkyway 编队注册（FORMATION_NAMES、FORMATION_COLORS、FORMATION_CHAIN_CONFIG、LIVING_MOTION）

## Impact

- `src/particles/formations.ts`: 新增 milkyway FormationGenerator 函数及所有配置注册
- `src/types/index.ts`: FormationName 联合类型新增 `'milkyway'`
- `src/store/useStore.ts`: `FORMATION_COUNT` 从 16 更新为 17
- 无新增依赖
