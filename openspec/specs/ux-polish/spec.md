## ADDED Requirements

### Requirement: Audio toggle uses CSS class styling
App.tsx 中的 audio toggle 按钮 SHALL 使用 globals.css 中定义的 `.audio-toggle` CSS class，不再使用内联 style 对象。

#### Scenario: Button uses CSS class
- **WHEN** audio toggle 按钮渲染
- **THEN** 按钮元素使用 `className="audio-toggle"` 而非内联 style 属性来定义样式

#### Scenario: Hover feedback available
- **WHEN** 用户将鼠标悬停在 audio toggle 按钮上
- **THEN** 按钮 SHALL 显示 hover 效果（背景色变化、文字颜色变化），由 CSS `.audio-toggle:hover` 规则提供

### Requirement: Formation name transition animation
当前 formation name 显示 SHALL 在阵型切换时具有淡出/淡入过渡动画效果。

#### Scenario: Name fades on formation change
- **WHEN** 用户触发阵型切换（键盘、滚轮或自动循环）
- **THEN** 当前 formation name SHALL 先淡出，新名称 SHALL 淡入显示

#### Scenario: Smooth opacity transition
- **WHEN** formation name 发生变化
- **THEN** opacity 过渡 SHALL 使用 CSS transition，过渡时长在 300-500ms 范围内
