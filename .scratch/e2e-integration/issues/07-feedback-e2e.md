# 07: Feedback 家族 E2E —— Toast / Alert / Avatar / Badge

**What to build:** 用例落在 `tests/e2e/specs/feedback.e2e.spec.ts`，覆盖计划 §5.2：

- **Toast（P0）**：四个变体均可触发并渲染；默认时长自动消失——用 `page.clock` 快进时间断言（禁止 `waitForTimeout` 硬等待）；`duration: 0` 常驻不消失；手动关闭可移除
- **Alert（P1）**：closable 关闭后「恢复」按钮出现，且点击可恢复
- **Avatar（P1）**：正常图片渲染；**404 图片 → 首字母回退**（真实网络失败路径；该用例需在守卫 fixture 显式豁免预期 404 并注释原因）
- **Badge（P2）**：根类冒烟

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] Toast：四变体 + `page.clock` 自动关闭 + duration 0 常驻 + 手动移除
- [ ] Alert：关闭 → 恢复按钮出现 → 可恢复
- [ ] Avatar：正常渲染 + 404 首字母回退（守卫豁免已注释原因）
- [ ] Badge 冒烟
- [ ] 其余用例 console / pageerror 守卫零违例；`pnpm e2e`（chromium）+ typecheck 全绿
- [ ] 变更仅限 `tests/e2e`
