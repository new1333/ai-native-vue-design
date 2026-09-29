# 文档站新增「页面构建块 Blocks」板块

按推荐项执行（问题未获答复）：**文档站内容层（shadcn blocks 模式）** + **标准批 5 块**。Block = 自包含单文件 Vue SFC 页面组合，只依赖 `@ui/components` 与 `--ui-*` token，文档站整页活预览 + 宽度切换 + 源码查看/一键复制。目录结构为未来升级 `@ui/blocks` 包（设计文档 §15 六层架构、registry/blocks.json）预留路径，但本次不做包、不做 registry。

## 一、新增：Block 源码（5 个自包含 SFC）

目录 `apps/docs/src/blocks/`（srcDir 外、不产生路由，与 demos 平级）。每个 block 一个文件、零本地依赖（只 `import ... from '@ui/components'`），根类 `ui-block-<kebab>`，样式 token-only，浏览器 API 仅 onMounted，含真实交互状态：

| 文件 | 内容 | 主要组合组件 |
|---|---|---|
| `AiWorkspaceBlock.vue` | AI 对话工作台（旗舰） | Layout/LayoutSider、MessageList、PromptInput、Suggestion、ModelSelector、AgentStatus、Reasoning、ToolCallCard、StreamingText、Avatar、Button |
| `LoginBlock.vue` | 登录页（校验/记住我/第三方登录） | Card 家族、Input、Checkbox、Button、Divider、Icon-Button |
| `DashboardBlock.vue` | 数据仪表盘（统计卡 + 表格 + 筛选） | Statistic、Card、Tabs、Table、Pagination、Badge、Select、Skeleton |
| `PricingBlock.vue` | 定价页（月/年切换、三档对比） | Card、ToggleGroup/Radio、Badge、Button、Divider |
| `SettingsBlock.vue` | 设置页（分区导航 + 表单 + 保存反馈） | Menu/Tabs、Form、Input、Textarea、Switch、Select、Avatar、Button、Toast |

交互要求：登录可触发校验、仪表盘可切 tab/排序/翻页、定价可切月年、设置可切分区并 toast 反馈、AI 工作台可发送消息与点击建议。

## 二、新增：BlockPreview.vue 预览容器

`apps/docs/.vitepress/theme/components/BlockPreview.vue`，仿 Demo.vue 的成熟机制（props `src/title/description`、shiki 懒高亮、navigator.clipboard 复制降级），差异点：

- **满宽破出**文档正文列宽（100vw 居中回移），预览舞台 `min-height: 560px`、背景 `var(--ui-bg)`、`overflow: auto` 自滚动，呈现「整页」感
- 工具条：**宽度切换**（桌面 100% / 平板 768px / 手机 390px，居中收缩、token 过渡）+ 查看源码 + 复制源码
- 样式全部 token-only；在 `theme/index.ts` 全局注册

## 三、新增：文档页

`apps/docs/src/zh/blocks/`（自动产生路由）：

- `index.md` —— 构建块总览（列表 + 简介 + 链接）
- `ai-workspace.md` / `login.md` / `dashboard.md` / `pricing.md` / `settings.md` —— 统一模板：frontmatter `title` + `<script setup>` 引入 SFC 与 `?raw` 源码 + `BlockPreview` + 「组成」（组件链接清单，须真实存在，过 dead-link 门禁）+ 「复制使用」（依赖 `@ui/components` + `@ui/tokens/paper.css`，token 跟随浅/深主题）

## 四、修改：接线（5 处小改，均在 apps/docs）

1. `config.ts` —— vite alias 增 `@docs-blocks → ../src/blocks`；nav 在「组件」与「设计 Token」之间增 `{ text: '构建块', link: '/blocks/', activeMatch: '/blocks/' }`
2. `tsconfig.json` —— `paths` 增 `@docs-blocks/*`（对齐 `@docs-demos/*`，纳入 vue-tsc 门禁）
3. `sidebar.ts` —— 新增并导出 `scanBlocks()`（扫 `src/zh/blocks/*.md`，排除 index，frontmatter title 为 label，stem 排序）；`buildSidebar()` 增 `'/blocks/'` 分组（「页面构建块」）；`buildHomeDirectory()` 追加 blocks 分组（首页 ComponentDirectory 自动出现，实现时验证其渲染不假设组件语义）
4. `llms.ts` —— 复用 `scanBlocks()`：llms.txt 索引增「页面构建块」段；逐块输出 `blocks/<name>.md`（标题 + 描述 + 完整 SFC 源码 ```vue 围栏）；llms-full.txt 拼入。自包含扫描，不碰 registry 门禁与组件链路
5. `docs/CONVENTIONS.md` —— §9 追加 blocks 小节（目录契约：`src/blocks/<Name>Block.vue` 单文件自包含、token-only、页面模板与扫描规则）

## 五、校验（全部真实运行，退出码 0）

- `pnpm -C apps/docs typecheck` —— 覆盖全部新 SFC 与配置
- `pnpm docs:build` —— 含 dead-link 检查与 llms 产物生成
- `pnpm docs:dev` 目检：5 个 block 页 + 总览页、浅色/夜纸暗色切换、宽度切换、源码复制、首页目录与侧边栏出现「构建块/页面构建块」
- 不改 `packages/components` 任何文件；不写裸视觉值

## 六、明确不在本次范围

`@ui/blocks` 包、`registry/blocks.json`、BlockDefinition meta 契约、e2e/视觉回归、playground 演示 —— 属于后续「包化升级」任务。