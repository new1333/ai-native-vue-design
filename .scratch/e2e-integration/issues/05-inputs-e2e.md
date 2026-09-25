# 05: Inputs 家族 E2E —— Input / Textarea / Checkbox / Radio / Switch

**What to build:** 用例落在 `tests/e2e/specs/inputs.e2e.spec.ts`，覆盖计划 §5.2：

- **Input（P0）**：输入后 clearable 按钮出现并点击清空；readonly / disabled 态行为断言（focus 单描边属视觉问题，由 10 号票视觉回归兜底，本票不做视觉断言）
- **Textarea（P1）**：输入后 show-count 计数正确；超 maxlength 输入被截断
- **Checkbox（P1）**：半选态点击后变为选中且半选态清除
- **Radio（P1）**：禁用项不可聚焦、不可选中
- **Switch（P1）**：loading 态拦截切换

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] Input：clearable 出现并清空；readonly / disabled 态断言
- [ ] Textarea：show-count 计数与 maxlength 截断
- [ ] Checkbox：半选 → 点击 → 选中且半选清除
- [ ] Radio：禁用项不可聚焦选中
- [ ] Switch：loading 态拦截切换
- [ ] console / pageerror 守卫零违例；`pnpm e2e`（chromium）+ typecheck 全绿
- [ ] 变更仅限 `tests/e2e`
