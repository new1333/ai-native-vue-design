# 08: Tabs E2E（P1 · 导航）

**What to build:** 用例落在 `tests/e2e/specs/navigation.e2e.spec.ts`，覆盖计划 §5.2：Tabs 的 roving tabindex——焦点随选中项移动（未选中 tab 不可通过 Tab 直接到达）；← → 方向键切换面板且联动文案更新（真实按键序列断言）。

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] roving tabindex 断言：焦点随选中项移动
- [ ] ← → 切换面板 + 联动文案断言（真实按键序列）
- [ ] console / pageerror 守卫零违例；`pnpm e2e`（chromium）+ typecheck 全绿
- [ ] 变更仅限 `tests/e2e`
