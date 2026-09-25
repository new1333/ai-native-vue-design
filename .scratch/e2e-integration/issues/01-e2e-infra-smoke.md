# 01: E2E 基建 + 冒烟（阶段 0）

**What to build:** 建立本仓库第一条可运行的 E2E 通道：在仓库根一条命令 `pnpm e2e` 即可自动拉起 playground，并在 chromium 真浏览器中跑通冒烟用例——7 个产品族分区（排版/通用/表单/数据/反馈/浮层/导航）h2 标题齐全、25 个组件的 `ui-*` 根类全部出现在 DOM、静态组件关键内容冒烟（Typography / Card / Divider / Button 渲染，IconButton `aria-label`），且 console 无 error、无 Vue 警告、无 pageerror。

交付物（依据 `docs/e2e-integration-plan.md` §3 / §6.1 / §6.2 / §7 阶段 0）：

- 新增 workspace 包 `tests/e2e`（包名 `@ui/e2e`，private），`pnpm-workspace.yaml` 的 packages 增加 `'tests/*'`
- `playwright.config.ts`：chromium 项目；`webServer` 以 `E2E_SERVER` 环境变量在 dev 与 build+preview 两种 command 间切换，统一探测 `http://localhost:5300`；失败保留 trace 与截图
- 守卫 fixture：console / pageerror / Vue 警告违例即测试失败，默认注入
- 页面对象：7 个 `#family-*` 分区 locator + 25 个组件 `ui-*` 根类清单（维护在页面对象内）
- `smoke.spec.ts`
- playground 的 vite 配置补 `preview.port: 5300`（沿用现有固定端口的 Windows 保留区间策略，仅此一项）
- 根 package.json 增加 `e2e` 脚本；tests/e2e 包内脚本命名 `e2e` / `typecheck`，**禁止命名为 `test`**（避免 `pnpm -r run test` 误拉起 E2E）

**Blocked by:** None（可立即开始）

**Status:** ready-for-agent

- [ ] `pnpm install && pnpm e2e` 退出码 0，冒烟用例全绿
- [ ] 冒烟覆盖：7 分区 h2 齐全、25 组件 `ui-*` 根类在 DOM、IconButton `aria-label` 断言、Typography/Card/Divider/Button 关键内容渲染
- [ ] console / pageerror / Vue 警告守卫默认生效，且当前 playground 页面零违例
- [ ] `E2E_SERVER=preview pnpm e2e`（生产构建 + preview）同样跑通
- [ ] 根 `pnpm typecheck`（含 tests/e2e）与 `pnpm -C packages/components test` 仍全绿
- [ ] 根 `pnpm test` 行为不变，不会拉起 E2E
- [ ] 变更范围仅限：`pnpm-workspace.yaml`、根 `package.json`（仅增脚本）、`apps/playground/vite.config.ts`（仅 preview.port）、`tests/e2e/**`；未触碰 `packages/components`

派发注意：动手前按 AGENTS.md 流程读 `docs/CONVENTIONS.md` 与计划书 §6.3 用例书写规约（定位器优先级、web-first 断言、禁 `waitForTimeout`、禁 `data-testid`）。
