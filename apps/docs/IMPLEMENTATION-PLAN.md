# 文档站体验升级 · 实施文档（已归档）

> **状态：已实施完毕（2026-09）**。T1–T11 全部落地；原任务正文（各任务的背景 / 改动文件白名单 / 分步实施 / 验收清单）已随本文件精简移除，全文见 git 历史（`git log --follow -- apps/docs/IMPLEMENTATION-PLAN.md`）。
> 本文件只保留三块仍然有效的内容：**§1 执行结果索引**（哪个任务、哪个提交、什么遗留）、**§2 暂缓清单**（尚未兑现的需求，删除即丢失）、**§3 总回归清单**（改动文档站后照着跑）。
> 现行站点规约见 `docs/CONVENTIONS.md` §9；本文与其冲突处以 CONVENTIONS 为准。

---

## 1. 执行结果索引（2026-09 逐项核验）

| 任务 | 结果 | 落地提交 | 备注 |
| --- | --- | --- | --- |
| T1 组件页锚点与「本页目录」 | ✅ 已落地 | `5f9ce8f` | 标题 id + Demo `anchor`；demo 锚点与组件小节 id 撞名（14 页 `states` + 2 页 `composition`）已于 2026-09 修复（改 `states-demo` / `composition-demo`） |
| T2 搜索索引接入 meta 与 token | ✅ 已落地 | `ca6e992` | `search-extra.ts` + `_render` 钩子；升级回归方法见 §4 |
| T3 「相关组件」自动互链 | ✅ 已落地 | `1cc81bd` | 已有文档页的 chip 渲染为链接 |
| T4 「引入」块复制按钮 | ✅ 已落地 | `8280c44` | |
| T5 自定义中文 404 页 | ✅ 已落地 | `fa98789` `b600649` | NotFound.vue 硬编码根路径已于 2026-09 改用 `withBase`；`dist/404.html` 空壳属 VitePress 机制，见 §4-7 |
| T6 站点配置包 | ✅ 已落地 | `aaa50e9` | editLink / socialLinks / lastUpdated / footer |
| T7 侧边栏中文名 | ✅ 已落地 | `c471504` | frontmatter title 单一事实来源 |
| T8 TokenBoard 一键复制 | ✅ 已落地 | `31f8127` | |
| T9 Token 实验器 | ✅ 已落地 | `3fbb7fe` | |
| T10 ApiTables 行锚点 + 契约版本 | ✅ 已落地 | `64f67e2` | |
| T11 暗色模式接入 | ✅ 计划外完成 | `f3a5972` `b9310f0` `1d6d200` | 计划原文标注「当前不要实施」；夜纸深色 Profile（token 层）交付后另行接入 `appearance: true`。T11-B 人工回归项已并入 §3 |

## 2. 暂缓清单（明确不做，防止自行发挥）

| 事项 | 暂缓原因 |
|------|----------|
| SEO（sitemap、ogImage） | 原「部署 / CI / SEO」条目的剩余部分；部署与 CI 已完成（`e863eeb`，GitHub Pages workflow + `base` 子路径配置） |
| i18n / 英文站 | `srcDir: src/zh` 已预留结构，成本高、非当前优先级 |
| 搜索换 DocSearch（Algolia） | 站点公开上线后再申请；local + T2 已够本地开发用 |
| demo「新窗口打开」/ StackBlitz 集成 / props knobs | 依赖部署形态与组件数量，先观察现状再定 |
| ApiTables 类型跳转、逐行 since 标注 | 需扩展 meta 契约（`shared/meta.ts` 只增不改字段语义），须走契约升级流程提案 |
| 可视「状态墙」（真实渲染 hover/focus/disabled 各态） | 需 meta 的 states 从字符串升级为可渲染结构，属契约升级提案 |
| 侧边栏折叠为分组下的搜索框 | 原因「组件数量少」已过时（现挂 65 个组件），收益需重新评估后再定 |

> 已移除条目：「组件页数量补齐」——65 个组件已全量有文档页（`7309469`、`73b1021`），暂缓前提消失。

---

## 3. 总回归清单（改动文档站后照着跑一遍）

`pnpm docs:dev` 起服务，逐项确认：

- [ ] 首页：AiWorkbench / ComponentDirectory 演示正常，页脚出现
- [ ] 导航栏：GitHub 图标；「指南 / 组件 / 设计 Token」跳转正常
- [ ] `/guide/installation`、`/guide/quickstart`、`/guide/theming`：目录正常、代码块复制按钮可用、「编辑此页」链接正确、最后更新时间显示
- [ ] `/components/general/button`：本页目录完整可点；`#api-props` / `#states` / `#icons` 直达；相关组件 Toast 可跳转；引入复制按钮；契约版本展示；「查看源码」展开高亮正常（主组件源码置顶）
- [ ] 任抽 2 个组件页：本页目录各锚点直达正确，页面无重复 id（demo `anchor` 不得与 `states` / `composition` 等小节 id 撞名——2026-09 曾有 16 页撞名，已修）
- [ ] `/components/data/table`、`/components/feedback/toast`：同上抽查
- [ ] `/tokens/`：TokenBoard + 复制 + 实验器（改 accent 只影响预览区）
- [ ] 搜索：`loading`（→Button）、`aria-busy`（→Button）、`accent`（→Token 页）、`表格`（→Table）均有结果；且组件页 DOM 上 `querySelectorAll('.vp-search-index-extra')` 长度为 0（语料只进索引、不进页面）
- [ ] `/no-such-page`：中文 404；404 页三个链接在本站 base 子路径下可达（`NotFound.vue` 已过 `withBase`）
- [ ] 暗色两档：右上角切换后全站无「白底残留块」；组件 demo 深色可读；焦点环两档可见；代码块配色正常（T11-B 验收要点，接入后尚未系统性回归过）
- [ ] 375px 视口：无横向溢出（首页 + 组件页 + Token 页）
- [ ] `pnpm -C apps/docs typecheck` 与 `pnpm docs:build` 退出码 0

---

## 4. 维护注意（原附录 B 的有效部分）

1. **dev 端口不是 5173**：终端会打印实际端口（5174 等），以终端为准。
2. **搜索索引不热更**：只改 meta / paper.css 不会自动重建索引，重启 dev 即可。
3. **`pnpm docs:build` 报 dead link**：死链检查是安全网，不要用 `ignoreDeadLinks` 关掉它。
4. **typecheck 报 `_render` 相关类型错误**：按 `search-extra.ts` 的写法——`DefaultTheme.LocalSearchOptions & { _render: … }` 交叉类型，`config.ts` 直接赋值、不加断言。若仍报错说明 vitepress 的类型声明有变化，带报错原文上报，不要改成 `any`。
5. **升级 vitepress 后**：`_render` 属内部钩子，升级后第一时间重跑 §3 的搜索回归项（四例搜索有结果 + 语料不进页面 DOM）；若钩子签名变了，带版本号上报，不要自行猜新 API。
6. **token 缺值**：按 CONVENTIONS §9.3，在任务结果中提出 token 需求，用既有 token 替代实现，严禁写裸值。
7. **`dist/404.html` 为客户端渲染空壳**：静态托管下无 JS 访客的 404 兜底是空白页（VitePress 机制使然；dev 与客户端路由下的 404 由 `NotFound.vue` 覆盖，记录备查）。
