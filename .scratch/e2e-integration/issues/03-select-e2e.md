# 03: Select E2E（P0）

**What to build:** 真浏览器验证 Select 浮层全路径（计划 §5.2 P0）：点击触发器开合且 `aria-expanded` 正确翻转；打开后 ↑↓ 移动 active 项；Enter 选中并回填触发器文案；disabled 项点击与键盘均不可选中；clearable 清空已选；空选项集显示 empty-text。浮层定位与真实焦点流转是 happy-dom 盲区，必须在此票补齐。

用例落在 `tests/e2e/specs/select.e2e.spec.ts`。

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] 点击开合 + `aria-expanded` 双向断言
- [ ] ↑↓ 移动 active 项、Enter 选中回填（真实按键序列）
- [ ] disabled 项不可选（点击与键盘两条路径）
- [ ] clearable 清空已选
- [ ] 空选项集显示 empty-text
- [ ] console / pageerror 守卫零违例；`pnpm e2e` + `pnpm -C tests/e2e typecheck` 全绿
- [ ] 变更仅限 `tests/e2e`
