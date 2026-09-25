# 04: 浮层三件套 E2E —— Dialog / DropdownMenu / Tooltip（P0）

**What to build:** 浮层家族的核心键盘契约在真浏览器全部落地（计划 §5.2 覆盖规则：浮层家族每条键盘路径必须有 E2E 键盘断言）：

- **Dialog**：打开后 `aria-modal="true"`、焦点移入对话框；连续按 Tab 多次（如 12 次）焦点循环**不出对话框**；Esc 关闭；确认后出现 toast
- **DropdownMenu**：Button 单元素插槽触发器上 `aria-haspopup` / `aria-expanded` 与组件自身属性**合并正确**（回归最近提交 a5478c2 修复的缺陷类别）；↑↓ 导航、Enter 选中并触发回调、Esc 关闭；disabled 项不可激活；点击外部关闭
- **Tooltip**：hover 显示与**键盘聚焦显示**两条路径；移开 / 失焦后消失

用例落在 `tests/e2e/specs/overlay.e2e.spec.ts`；计划 §6.4 给出 Dialog 用例的书写风格样板。

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] Dialog：aria-modal、焦点移入、Tab×N 不出框、Esc 关闭、确认→toast
- [ ] DropdownMenu：触发器 aria 属性合并断言 + ↑↓ / Enter / Esc 全键盘路径 + disabled 项 + 点击外部关闭
- [ ] Tooltip：hover 显示、键盘聚焦显示、移开消失
- [ ] console / pageerror 守卫零违例；`pnpm e2e`（chromium）+ typecheck 全绿
- [ ] 变更仅限 `tests/e2e`
