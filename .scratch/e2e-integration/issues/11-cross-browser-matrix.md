# 11: 多浏览器矩阵 —— webkit / firefox（阶段 3 中段）

**What to build:** 在 chromium 全部用例（02–08）与 axe（09）、视觉基线（10）落地之后，为 `playwright.config.ts` 增加 webkit 与 firefox 项目并跑绿全部存量用例；axe 与视觉用例通过项目配置明确限定 chromium-only（避免引擎规则差异与跨平台基线噪音）；排查并修复平台差异导致的 flaky（焦点细节、键盘事件差异等），不得用重试掩盖。

**Blocked by:** 02: Form / 03: Select / 04: 浮层三件套 / 05: Inputs / 06: Data / 07: Feedback / 08: Tabs / 09: axe 扫描 / 10: 视觉基线（即除 12、13 外全部票）

**Status:** ready-for-agent

- [ ] webkit / firefox 项目加入后，全部 E2E 用例三浏览器全绿
- [ ] axe 与视觉用例限定 chromium（配置化，不逐条散落注释）
- [ ] 平台差异 flake 已定位修复，或登记原因与后续 issue
- [ ] `pnpm e2e` 全矩阵退出码 0；变更仅限 `tests/e2e`
