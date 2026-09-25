# 09: axe 无障碍分区扫描（阶段 2）

**What to build:** 引入 `@axe-core/playwright`，对 playground 的 7 个产品族分区逐一执行 axe 规则扫描，断言 violations 为空。确有无法立即修复的违例：登记豁免清单（规则 tag + 原因 + 关联 issue 链接），**禁止静默忽略**；豁免必须精确到规则与元素范围，不得整页跳过。

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] 7 个分区逐一扫描，断言零违例
- [ ] 如有违例：豁免清单登记（tag + 原因 + issue 链接），逐条注释
- [ ] `pnpm e2e`（chromium）含 axe 用例退出码 0；typecheck 全绿
- [ ] 变更仅限 `tests/e2e`（新增依赖与 spec）
