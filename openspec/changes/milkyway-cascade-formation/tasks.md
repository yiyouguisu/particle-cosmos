## 1. 类型注册

- [x] 1.1 在 `src/types/index.ts` 的 FormationName 联合类型中添加 `'milkyway'`
- [x] 1.2 在 `src/store/useStore.ts` 中将 FORMATION_COUNT 从 16 更新为 17

## 2. 编队函数实现

- [x] 2.1 在 `src/particles/formations.ts` 中实现 milkyway FormationGenerator 函数：三段式路径（弧 → 汇聚 → 倾泻），通过 `((index/total) + time * flowSpeed) % 1.0` 驱动粒子流动
- [x] 2.2 实现非线性 t 映射使弧段粒子密集、倾泻段稀疏
- [x] 2.3 实现随 t 变化的横向散布宽度函数（弧段 ~0.15、汇聚 ~0.03、散落 ~0.12）

## 3. 编队注册

- [x] 3.1 将 `milkyway` 添加到 `FORMATION_NAMES` 数组
- [x] 3.2 将 `milkyway` 添加到 `formations` 映射表
- [x] 3.3 配置 `FORMATION_COLORS.milkyway`（银蓝色调 a: [0.7, 0.8, 1.0], b: [0.95, 0.95, 1.0]）
- [x] 3.4 配置 `FORMATION_CHAIN_CONFIG.milkyway`（蓝银系光链配色）
- [x] 3.5 在 `LIVING_MOTION` 中标记 `milkyway: true`

## 4. 验证

- [x] 4.1 运行 typecheck 和 lint 确保无编译错误
- [ ] 4.2 在浏览器中验证天河编队的视觉效果：粒子沿路径持续流动
- [ ] 4.3 验证弧段密集、倾泻段稀疏的变速效果
- [ ] 4.4 验证编队切换 morph 过渡正常
- [ ] 4.5 验证编队总数正确（17 个循环）
