# Particle Cosmos

交互式 3D 粒子可视化，包含 10,000 个粒子在 17 种数学编队间变形，实时生成式音频，以及鼠标驱动的物理交互。

[English](README.md) | 中文

## 特性

- **17 种编队** — Lorenz、Clifford、Aizawa、Thomas、Rössler、Halvorsen 吸引子；Möbius、Klein、Trefoil、Cinquefoil 纽结；Torus、Shell、Helix 曲面；Harmonics 球谐、Rhodonea 玫瑰线；Diffuse 弥散星云；Milkyway 天河倾泻
- **活体运动** — 参数化编队持续演化（吸引子漂移、纽结旋转、银河闪烁）
- **磁场交互** — 鼠标移动产生切向漩涡（慢速）或径向撕裂（快速），停留时涡旋增强
- **点击效果** — 冲击波（单击）、黑洞吸引-爆炸（双击）、引力坍缩（长按）
- **动态光链** — 螺旋漫游的光链追逐鼠标，每个编队有独立的色彩渐变
- **生成式音频** — FM 无人机、共振噪声、次低音、随机 FM 铃声事件、五声音阶旋律 — 全部实时合成，无采样
- **平滑变形** — 3.5 秒交错缓动的编队切换过渡

## 快速开始

```bash
npm install
npm run dev
```

## 操作说明

| 输入 | 效果 |
|------|------|
| 鼠标移动 | 磁场 — 旋绕或撕裂粒子 |
| 单击 | 冲击波 — 扩散环形力场 |
| 双击 | 黑洞 — 吸引后爆炸 |
| 长按 (>0.3s) | 引力坍缩，松手后爆炸 |
| 滚轮 / 方向键 | 切换编队 |
| 空格 | 暂停自动轮播 |

## 技术栈

- React + TypeScript
- Three.js（通过 @react-three/fiber）
- 自定义 GLSL 着色器（粒子 + 线条渲染）
- Zustand（状态管理）
- Web Audio API（生成式音频）
- Vite（构建工具）

## 架构

```
用户输入 → useMouseTracking → Zustand store → ParticleField useFrame 循环
  → 编队生成器 + 物理力场 → 自定义着色器 → GPU
  → AudioEngine（独立运行）
```

## 许可证

MIT
