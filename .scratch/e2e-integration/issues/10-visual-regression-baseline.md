# 10: 视觉回归基线（阶段 3 前半）

**What to build:** 以 playground 卡片为单位的截图对比体系（计划 §5.4）：

- 确定性 fixture：注入 `prefers-reduced-motion: reduce` 并将 `--ui-motion-*` 覆盖为 0s（走标准机制，禁止为可测性给组件加测试专用 props / 类名）；固定视口 1280×720；固定字体
- 每张 Card 一个 clip 截图，叠加交互态：default / hover / focus-visible / disabled / loading / error（按组件适用性取用）——focus-visible 态直接兜底「Input 双描边」这类缺陷
- 基线管理：`pnpm e2e:update-snapshots` 一条命令更新；基线文件入库；本地（macOS）与 CI（Linux）基线靠 Playwright 快照平台后缀天然隔离，CI 侧基线由 12 号票在 Linux 环境生成
- 命名对齐设计文档 27.2：`tests/e2e/visual/<family>.visual.spec.ts`

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] reduced-motion + token 覆盖 fixture 生效
- [ ] 25 个组件卡片截图基线入库，含各自适用交互态（focus-visible 必备）
- [ ] `pnpm e2e:update-snapshots` 可用；更新后二次 `pnpm e2e` 全绿无 diff
- [ ] console / pageerror 守卫零违例；`pnpm e2e`（chromium）+ typecheck 全绿
- [ ] 变更仅限 `tests/e2e`
