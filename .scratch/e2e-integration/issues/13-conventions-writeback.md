# 13: E2E 规约回写文档（收尾）

**What to build:** 将实践中定稿的 E2E 规约沉淀进仓库文档（计划 §9 整体 DoD 第 5 条）：把计划 §6.3 的用例书写规约（定位器优先级、web-first 断言、禁 `waitForTimeout`、禁 `data-testid`、守卫豁免纪律、键盘真实按键序列）与 §4 分层职责划分（组件单测 / E2E / 视觉 / axe 各管什么、明确不负责什么），回写进 `docs/CONVENTIONS.md` 新增「E2E 测试」一节，或独立 `tests/e2e/README.md`（二选一，以信息密度与查阅路径定）。若实践对 §6.3 有修订，以实际落地为准回写并注明。

**Blocked by:** 01: E2E 基建 + 冒烟（建议在 02–12 全部落地后收尾执行，确保回写内容经过实践检验）

**Status:** ready-for-agent

- [ ] 规约成文，覆盖 §6.3 全部条目 + §4 分工原则
- [ ] 与 `docs/CONVENTIONS.md` §7（组件用例规约）无冲突、有互引
- [ ] 变更仅限 `docs/` 或 `tests/e2e/README.md`
