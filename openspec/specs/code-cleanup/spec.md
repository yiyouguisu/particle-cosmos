## ADDED Requirements

### Requirement: Remove unused store state and actions
Zustand store SHALL 不包含未被任何组件消费的状态字段和 action。具体移除：`click` 状态、`mouseTrail` 状态、`triggerClick`、`clearClick`、`setClickHoldDuration`、`addTrailPoint`、`pruneTrail` action。

#### Scenario: Store contains only used fields
- **WHEN** 开发者检查 useStore 定义
- **THEN** store 中不存在 `click`、`mouseTrail` 状态字段及其关联 action

#### Scenario: Types cleaned up
- **WHEN** store 的未使用状态被移除
- **THEN** `types/index.ts` 中对应的 `ClickInteraction`、`MouseTrailPoint` 类型 SHALL 被移除（如无其他引用）

### Requirement: Remove legacy CSS styles
globals.css SHALL 不包含与当前粒子场景无关的遗留样式，包括 `.zone-canvas`、`#cloud-zone`、`#water-zone`、`#dune-zone`、`#starfield-zone`、`.zone-boundary`、`#cloud-water-boundary`、`#water-dune-boundary`、`.sunrise-overlay`、`.horizon-glow` 及其关联的 keyframe 动画。

#### Scenario: Legacy styles removed
- **WHEN** 开发者检查 globals.css
- **THEN** 不存在 zone-canvas、zone-boundary、sunrise-overlay、horizon-glow 等遗留样式规则

#### Scenario: Active styles preserved
- **WHEN** 遗留样式被移除
- **THEN** 基础样式（`*` reset、`html,body,#root`）、`.audio-toggle`、`.hint-toast`、`.star-hint` 等当前使用或可能使用的样式 SHALL 保持不变
