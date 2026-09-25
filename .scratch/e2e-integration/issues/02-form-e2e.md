# 02: Form / FormField E2E（P0）

**What to build:** 以 playground 表单演示为载体，在真浏览器验证 Form / FormField 的关键提交路径：空提交后出现两条字段错误文案；输入框聚焦状态下按 Enter 触发**隐式提交**（依赖真实 form 语义与焦点位置，happy-dom 盲区）；合法提交后提交按钮进入 loading 态并弹出 success toast。

用例落在 `tests/e2e/specs/form.e2e.spec.ts`，断言范围对应计划书 §5.2 P0 行；书写遵循 §6.3 规约（getByRole 优先、分区 locator 收窄作用域、web-first 断言、键盘路径用真实按键序列）。

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] 空提交：两条错误文案可见
- [ ] Enter 隐式提交：输入框聚焦时按 Enter 等价于点击提交（真实键盘序列断言）
- [ ] 合法提交：按钮 loading 态出现 → success toast 出现
- [ ] console / pageerror 守卫零违例
- [ ] `pnpm e2e`（chromium）退出码 0；`pnpm -C tests/e2e typecheck` 通过
- [ ] 变更仅限 `tests/e2e`（spec 文件；如需分区定位辅助可扩展 `pages/`）
