# 12: CI 工作流 —— GitHub Actions PR 门禁（阶段 3 收口）

**What to build:** 新增 `.github/workflows/e2e.yml`，让 E2E 成为 PR 门禁：

- pnpm 依赖缓存 + Playwright 浏览器缓存
- `E2E_SERVER=preview`（vite build + preview，同时覆盖生产构建路径回归）
- **在 Linux 环境生成视觉基线**（跨平台基线策略的 CI 侧落地：本地 macOS 基线不用于 CI）
- 失败产物上传：trace + 截图，可从 CI 下载
- 路径过滤：`packages/components/src/**`、`apps/playground/**`、`tests/e2e/**` 变更才触发
- E2E 作为独立 job，不与组件单测 job 互相阻塞

**Blocked by:** 01–11（全部用例与基线稳定后收口，避免 CI 反复补丁）

**Status:** ready-for-agent

- [ ] PR 上工作流全绿（三浏览器 + 视觉对比 + axe）
- [ ] 失败时 trace / 截图产物可从 CI 下载
- [ ] 路径过滤生效：无关变更不触发
- [ ] 变更仅限 `.github/`
