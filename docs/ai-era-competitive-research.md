# AI 时代竞品研究报告：Paper vs Vue 3 组件库竞品

> - **研究日期**：2026-09-28
> - **方法**：deep-research 多 agent 工作流 —— 5 个搜索角度 → 24 个一手来源 → 108 条候选论断 → 25 条进入三票对抗验证（**22 确认 / 1 否证 / 2 未决**），另含本地仓库一手核实
> - **规模**：106 个 agent 调用，约 42 分钟，8 个验证 agent 因 API 速率限制（429）失败（影响见 §7）
> - **一句话结论**：AI 友好能力已是设计系统行业标配，Paper 在「AI 接入层」（llms.txt / MCP / agent skill）目前为空白，必须补基线；但 Paper 手里有三张竞品没有的牌——**结构化 meta 机器可读契约、9 个 AI 展示组件、token-only + 内置主题层**，且第一张牌让补基线的成本趋近于零。

## 0. 研究问题与范围

对「纸面 (Paper)」AI-native Vue 3 组件库（pnpm monorepo：`@ui/tokens` 提供 `--ui-*` 设计 token 与 Paper Profile 视觉规范，`@ui/components` 组件以结构化 meta 驱动 VitePress 文档 API 渲染，强制 token-only 视觉、SSR 纪律、a11y 与四类组件测试）做竞品现状对比与差距建议研究。

- **竞品范围**（Vue 3 直接竞品）：Element Plus、Ant Design Vue、Naive UI、PrimeVue、Vuetify、Reka UI / Radix Vue、shadcn-vue
- **参考标杆**（范围外，但不可回避）：Nuxt UI
- **四个维度**：① LLM/Agent 友好性；② AI 原生组件能力；③ Token 化与主题/无头化；④ 工程质量与信任

## 1. 执行摘要

1. **行业基线已量化**（高置信）：2026-07 对 21 个开源设计系统的实证普查显示，MCP server 普及率 20/21、agent skill 19/21、仓库级 agent 文件 16/21、llms.txt 15/21。声称 AI-native 的门槛是「MCP server + llms.txt + agent skill + 仓库 agent 文件」四件套。
2. **Paper 四件套缺口三件**（本地核实）：仓库目前仅 AGENTS.md（内部协作协议），MCP / llms.txt / agent skill 均为空白。
3. **竞品已分层落地**：Vuetify 有官方 MCP（免鉴权托管端点）；PrimeVue 有 llms.txt / llms-full.txt / 逐页 .md；shadcn-vue 有官方 MCP（自然语言装组件）；Reka UI 有 llms.txt + 全量文档 .md 版。
4. **Nuxt UI 是全栈 AI-native 标杆**：MCP + agent skill + 文档 AI 助手（Nuxt Agent）+ 8 个 AI 聊天组件一级产品线（深度集成 `@ai-sdk/vue` useChat）。
5. **Paper 的真实差异化**：结构化 meta 驱动的机器可读组件契约（65/65 registry，竞品为手写文档）、9 个 AI 展示组件（七个指定竞品中无对应物）、`--ui-*` token-only 硬约束 + 内置 Paper Profile 主题层（卡在 Reka 零 token 与 shadcn-vue DIY 主题之间的空位）。
6. **机会窗口的精确表述**：在**七个指定竞品内部**与 **AI SDK 数据模型适配层**，而非「整个 Vue 生态」——Nuxt UI 已有聊天组件，社区另有 ant-design-x-vue（见 §7 警示 1）。

## 2. 行业基线（置信度：高，验证 3-0）

来源：[State of AI in Design Systems](https://state-of-ai-in-design-systems.netlify.app)（Kaelig，W3C Design Tokens CG 联席主席，2026-07-26/28 采集，21 个开源设计系统 field study + 147 人从业者问卷）

| AI 友好能力 | 普及率（21 个系统中） |
|---|---|
| MCP server | **20/21** |
| Agent skill | **19/21** |
| 仓库级 agent 文件（AGENTS.md / CLAUDE.md） | **16/21** |
| llms.txt | **15/21** |
| AI 专属文档 | 15/21 |
| Registry | 11/21 |
| CLI | 9/21 |
| Code Connect | 3/21 |

15/21 系统已达「AI-native 档」。结论：**四件套（MCP server、llms.txt、agent skill、仓库 agent 文件）是 AI-native 的门槛基线**。

**Paper 现状（本地核实）**：仅 AGENTS.md 一项；MCP / llms.txt / agent skill 三项为零（仓库内 grep 无任何相关基础设施，仅设计文档提及）。

## 3. 竞品对比矩阵（live 实测 2026-09-28，多组 3-0 验证）

| 竞品 | llms.txt / 机器可读文档 | MCP server | AI 原生组件 | Token 化与主题 |
|---|---|---|---|---|
| **Vuetify** | — | ✅ 官方 `@vuetify/mcp`（竞品内先发），免鉴权托管端点 `https://mcp.vuetifyjs.com/mcp`（文档/API/安装升级工具；`/one` 端点需 Vuetify One OAuth），2026-08 达 v0.11.0 | — | — |
| **PrimeVue** | ✅ llms.txt（~15KB，`/llms/` 前缀）+ llms-full.txt（~2.33MB，2026-09-08 生成）+ **任意文档页 URL 加 `.md` 后缀取 Markdown 版** | — | — | a11y 文档改为逐组件 Accessibility 章节（原汇总页 404） |
| **shadcn-vue** | — | ✅ 官方 MCP：`npx shadcn-vue@latest mcp`，官方文档给出 Claude Code / Cursor / VS Code / Codex / Opencode 五种客户端配置，支持自然语言浏览/搜索/安装 registry 组件（MCP 仅服务其 registry） | — | CSS 变量为核心且默认启用（组件默认消费 background/foreground/primary 等语义 token）；但**不内置暗色 Provider 或主题切换组件**（Vite 指南要求自装 `@vueuse/core` 的 `useColorMode`），且 `--no-css-variables` 是安装期不可逆决定 |
| **Reka UI / Radix Vue** | ✅ llms.txt + 全部 89 篇文档链接到 `.md` 纯 Markdown 版 | —（未发现官方 MCP） | — | **headless 极端**：官方样式指南仅提供 class 透传与 data-state 状态属性两类钩子，全页无任何 design token / CSS 变量体系 |
| **Element Plus** | ⚠️ 盲区（见 §7） | 未发现官方 MCP（弱负向） | ⚠️ 盲区 | — |
| **Ant Design Vue** | ⚠️ 盲区（Ant Design 本体的系统化 AI 布局因验证故障未核实，见 §7） | 未发现官方 MCP（弱负向） | ⚠️ 盲区（社区有 ant-design-x-vue，非官方） | — |
| **Naive UI** | ⚠️ 盲区 | 未发现官方 MCP（弱负向） | ⚠️ 盲区 | — |
| *Nuxt UI（标杆，非七竞品）* | ✅ llms.txt + llms-full.txt（~2.2MB）+ sitemap.md + markdown 内容协商 | ✅ 官方 MCP + agent skill（`.well-known/skills/`）+ agent 发现层（`.well-known/api-catalog`、`mcp/server-card.json`）+ 文档 AI 助手（Nuxt Agent，基于 AI SDK + MCP + Nuxt UI 构建） | ✅ v4.11.2 内置 **8 个 AI 聊天组件**（ChatMessages / ChatMessage / ChatPrompt / ChatPromptSubmit / ChatReasoning / ChatTool / ChatShimmer / ChatPalette）为一级产品线，深度集成 Vercel AI SDK v7（`@ai-sdk/vue` useChat） | — |

来源：[@vuetify/mcp (npm)](https://www.npmjs.com/package/@vuetify/mcp) · [primevue.dev/llms](https://primevue.dev/llms) · [shadcn-vue MCP 文档](https://www.shadcn-vue.com/docs/mcp.html) · [reka-ui.com/llms.txt](https://reka-ui.com/llms.txt) · [Nuxt UI Chat 文档](https://ui.nuxt.com/docs/components/chat) · [shadcn-vue theming](https://www.shadcn-vue.com/docs/theming.html) · [shadcn-vue dark-mode](https://www.shadcn-vue.com/docs/dark-mode.html) · [Reka UI styling](https://www.reka-ui.com/docs/guides/styling)

验证器对关键端点做了 curl 实测（MCP initialize 200、llms.txt 200 text/plain、`.md` 301→200、tools/list 工具面逐一对应）。

### AI 原生组件的行业供给面

- AI SDK 官方文档将 **Generative User Interfaces** 列为一级章节；`UIMessage parts` 数据模型（`text`、`reasoning`、`tool-{toolName}` 工具部件）在 Vue 侧有官方一手代码证据（`@ai-sdk/vue` useChat 遍历 `m.parts` 按 type 渲染）——验证 3-0。来源：[ai-sdk.dev](https://ai-sdk.dev/docs/getting-started/nuxt)
- [CopilotKit](https://github.com/CopilotKit/CopilotKit)（支持 Vue）提供 chat UI + 运行时生成式 UI + 后端工具渲染的参考实现——验证 2-0。Vue 支持成熟度存疑（见 §8）。
- React 侧 [Scrim UI](https://scrimui.dev)（55 组件 / 12 模式 / 73 图标 / 14 工具，免费 + 一次付费终身更新 Pro）证明「AI 原生组件库」已是独立品类——验证 2-1（弱通过，见 §7）。

## 4. Paper 已有的差异化优势（本地仓库一手核实）

| # | 优势 | 说明 |
|---|---|---|
| ① | **结构性优势：机器可读组件契约**（最值钱的一张牌） | 65 个组件全部以结构化 meta 驱动 VitePress 文档 API 渲染；registry 65/65 全覆盖 + meta 契约 73 项测试对账。竞品文档是手写的，Paper 这套资产使 **llms.txt / 逐页 .md / MCP 数据源的生成成本趋近于零**——竞品要补同样的能力，得先补数据模型 |
| ② | **AI 展示组件先发** | prompt-input、streaming-text、reasoning、tool-call-card、artifact、agent-status、model-selector、suggestion、message-list 共 **9 个 AI 系组件，在七个指定竞品中均无对应物**（注意：Nuxt UI 有 8 个聊天组件，见 §7 警示 1） |
| ③ | **Token 化路线的真实空位** | `--ui-*` token-only 硬约束 + 内置 Paper Profile 视觉，正好卡在 Reka UI（零 token、headless 极端）与 shadcn-vue（token 有但暗色/主题切换 DIY、`--no-css-variables` 不可逆）之间——「token 硬约束 + 预设视觉」的组合两家都没有 |
| ④ | **工程质量故事** | token-only 视觉硬约束、四类组件测试（api / behavior / a11y / ssr）、SSR 纪律（浏览器 API 仅限 onMounted）、共享层收口（浮层引擎 / 模态层 / 受控开合 / 列表导航） |

## 5. 差距清单

- ❌ **llms.txt / llms-full.txt / 逐页 .md**：无（行业 15/21，四竞品已有）
- ❌ **官方 MCP server**：无（行业 20/21，三竞品已有）
- ❌ **agent skill 与 `.well-known` 发现层**：无
- ❌ **AI 组件数据模型适配**：现有 9 个 AI 组件全部是 props 驱动被动展示，无 `@ai-sdk/vue` UIMessage parts 模型（`text` / `reasoning` / `tool-{toolName}`）适配，无运行时生成式 UI 能力

## 6. 应补齐优势路线（按投入/影响排序）

| # | 动作 | 投入 | 影响 | 对标 |
|---|---|---|---|---|
| ① | **VitePress 构建钩子从现有 meta / registry 自动生成** llms.txt + llms-full.txt + 逐页 `.md` | 近零成本（①的成本优势直接来自 §4-① 的 meta 契约资产） | 高——直接补齐行业基线 15/21 项 | PrimeVue / Reka UI |
| ② | **官方 MCP server**（数据源即 meta registry；形态先本地 `npx` 式对标 shadcn-vue，后加免鉴权托管端点对标 Vuetify）+ **官方 agent skill** + `.well-known` 发现层 | 中 | 高——补齐行业基线 20/21、19/21 项 | shadcn-vue → Vuetify → Nuxt UI |
| ③ | **AI 组件适配 `@ai-sdk/vue` UIMessage parts 模型**（useChat 直连），从被动 props 升级为 AI SDK 数据模型原生 | 中高 | 高——**超车点**：七竞品均无，Nuxt UI 也只做自家绑定 | AI SDK 官方 parts 模型（验证 3-0） |
| ④ | 运行时生成式 UI 映射 + 文档站 AI 助手 | 探索性 | 中 | CopilotKit / Nuxt Agent |

**附加动作**：把「meta 契约 73 测试」包装为**「文档-实现一致性 → AI 代码生成准确率」的信任卖点**。学术依据：LLM 生成代码的幻觉主要来自「API 知识冲突 / 库知识冲突」（即使提供文档上下文仍会发生），机器可读且与实现强一致（测试对账）的契约正是对症解法。来源：[LLM Hallucinations in Practical Code Generation (arXiv 2409.20550)](https://arxiv.org/abs/2409.20550)

排序逻辑：先补基线空白（当前为零），再做差异化增强。

## 7. 警示与局限（对抗验证的真实结果，引用本报告前必读）

1. **一条 claim 被对抗验证否证（1-2）**：「七个竞品均无 AI 聊天组件、Paper 可填该空白」**不成立**——Nuxt UI 已有 8 个聊天组件（v4.11.2），社区另有 ant-design-x-vue（非七个竞品，且 Ant Design 官方明确无 Vue 计划）。**对外表述须避免「Vue 生态完全空白」的绝对化措辞**；Paper 的机会窗口在七个指定竞品内部与 AI SDK 数据模型适配层。
2. **覆盖盲区**：Element Plus、Ant Design Vue、Naive UI 三家的 AI 现状因验证器基础设施故障（API 429 速率限制，共 8 个验证 agent 失败）未能核实；「未发现官方 MCP」对这三家只是弱负向证据。Ant Design 本体的系统化 AI 布局（MCP / llms.txt 三件套 / CLAUDE.md / `@ant-design/cli`）与 CopilotKit Vue 支持成熟度两条 claim 处于「未决」状态。
3. **维度④（工程质量与信任）无存活 claims**：npm 下载量等数据虽被抓取到，但未通过完整验证流程，本报告不对该维度下结论（原始数据见附录 B，**不可直接引用**）。
4. **时效性**：所有 live 核验截至 2026-09-28；行业研究数据采集于 2026-07-26/28。该领域以月为单位演化（Vuetify MCP 2026-08 即达 v0.11.0、PrimeVue llms-full.txt 2026-09-08 再生），**本报告数字预计 3-6 个月内需复核**。
5. **弱源提示**：Scrim UI 为 2-1 弱通过（「独立品类」推断部分超出引文）；Nuxt UI `applyTheme` 工具名字面未独立确认；行业研究覆盖通用开源设计系统而非七家 Vue 竞品，竞品级结论依赖验证器 live 抽查而非系统性普查；MCP 普及率 20/21 含社区自建 server。

## 8. 开放问题（后续研究/验证项）

1. Element Plus、Ant Design Vue、Naive UI 三家的 AI 面向能力（MCP server、llms.txt、agent 文件）现状究竟如何？——需补查后才能完成完整竞品矩阵。
2. CopilotKit 的 Vue 支持（Vue 3 组件文档已存在）成熟度到什么程度——Quickstart 是否仍是 "coming soon"？这决定 Vue 侧生成式 UI 运行时的真实可用基线与 Paper 机会窗口大小。
3. Paper 的 meta 契约能否无损映射为 MCP tools 与 shadcn 式可安装 registry？现有 9 个 AI 展示组件的 props 与 `@ai-sdk/vue` UIMessage parts 模型之间的适配工程量——需本地 PoC 验证。
4. MCP server 形态与发布策略选择：本地 `npx`（shadcn-vue 式，零运维）vs 免鉴权托管端点（Vuetify 式，开箱即用但需基础设施）；是否对外开放组件安装 registry，还是仅文档/API 查询？

## 附录 A：论断明细（含验证票型）

### A1. 行业基线（置信度：高，票型 3-0）

MCP server 普及率 20/21、agent skill 19/21、仓库 agent 文件 16/21、llms.txt 15/21、AI 专属文档 15/21、registry 11/21、CLI 9/21；Paper 仅 AGENTS.md 一项，其余三件套空白。
**证据**：验证器逐项核对九个数字完全一致；15/21 系统已达 AI-native 档。来源：[state-of-ai-in-design-systems](https://state-of-ai-in-design-systems.netlify.app)

### A2. 竞品 AI 接入层矩阵（置信度：高，多组 3-0 / 2-0）

Vuetify `@vuetify/mcp` 竞品内先发、免鉴权托管端点、v0.11.0（2026-08）；PrimeVue llms.txt（~15KB）+ llms-full.txt（~2.33MB）+ 逐页 `.md`；shadcn-vue 官方 MCP 五种客户端配置；Reka UI llms.txt + 89 篇 `.md` 文档。
**证据**：验证器对每个端点做 curl 实测（MCP initialize 200、llms.txt 200 text/plain、`.md` 301→200、tools/list 工具面逐一对应）。Reka UI 有 llms.txt 但无官方 MCP；shadcn-vue 的 MCP 仅服务其 registry。来源：见 §3。

### A3. Nuxt UI 全栈标杆（置信度：高，票型 3-0 + 3-0）

官方 MCP、llms.txt / llms-full.txt（~2.2MB）、agent skill（`.well-known/skills/`）、Nuxt Agent 文档 AI 助手、agent 发现层（`.well-known/api-catalog`、`mcp/server-card.json`、sitemap.md、markdown 内容协商）；v4.11.2 内置 8 个 AI 聊天组件，深度集成 `@ai-sdk/vue` useChat。
**证据**：验证器绕过引文直接 live 核验 ui.nuxt.com：llms.txt / llms-full.txt 200、SKILL.md 200、api-catalog 返回 application/linkset+json、markdown 内容协商可用、8 组件清单逐字一致。唯一未确认细节：`applyTheme` 工具名字面拼写。

### A4. AI 原生组件供给面（置信度：中，票型 3-0 / 2-0 / 2-1）

AI SDK 将 Generative UI 列为一级章节，UIMessage parts 模型在 Vue 侧有官方一手代码证据（3-0）；CopilotKit 提供 chat UI + 运行时生成式 UI 参考实现（2-0，Paper 仓库无 agent 运行时经本地核实）；Scrim UI 证明「AI 原生组件库」已是独立品类（2-1，最接近争议——四个数字逐字验证但属编辑性推断部分超出引文）。Paper 已有 AI 展示组件但均为 props 驱动被动展示。

### A5. Token 化两极格局（置信度：高，票型 3-0 / 2-0 组）

Reka UI headless 极端（官方样式指南零 token / CSS 变量，仅 class 透传 + data-state）；shadcn-vue CSS 变量默认启用（语义 token + `.dark` 覆盖同一套变量）但无暗色 Provider / 主题切换组件（Vite 指南要求自装 `@vueuse/core` `useColorMode`），`--no-css-variables` 安装期不可逆。二者均无 Paper 式「token 硬约束 + 预设 Paper Profile 视觉」组合。
**证据**：官方一手文档 live 抓取逐字核实。

### A6. Paper 优势清单（本地核实，无票型）

65 组件目录（Glob）含 9 个 AI 系组件；registry 65/65 + meta 契约 73 测试；仓库内 grep 无 llms.txt / MCP 基础设施。优势与差距均经一手核实，非转述。

### A7. 被否证的 claim（1-2）

> 原始 claim：「Vercel AI SDK 为 Vue/Nuxt 提供专门的 `@ai-sdk/vue` 包（useChat），而被调研的七竞品均未提供 AI 聊天组件——Paper 可通过开箱即用的 chat UI 组件填补该空白。」

**否证原因**：Nuxt UI 已有 8 个聊天组件。「AI 聊天组件」在 Vue 生态不是空白；SDK 逻辑层供给（useChat）这半句本身属实（3-0），被否的是「空白」推论。来源：[ai-sdk.dev](https://ai-sdk.dev/docs/getting-started/nuxt)、[ui.nuxt.com](https://ui.nuxt.com/docs/components/chat)

### A8. 未决 claim（验证 agent 因 429 故障，1 有效票 / 2 错误票）

1. Ant Design 已系统化布局 AI 面向能力：官方 MCP server、llms.txt / llms-full.txt / llms-semantic.md 三件套、For Agents 文档页、根目录 291 行 CLAUDE.md、六个维护者 skill、提供 setup/lint/migrate 命令的 `@ant-design/cli`。来源：[state-of-ai-in-design-systems](https://state-of-ai-in-design-systems.netlify.app)
2. CopilotKit 对 Vue 标记「Supported」但官方 Quickstart 仍为 "coming soon"（React/Next.js 已 GA）——Vue 侧 copilot / 生成式 UI 基础设施成熟度落后于 React。来源：[CopilotKit (GitHub)](https://github.com/CopilotKit/CopilotKit)

## 附录 B：未通过完整验证的参考数据（不可直接引用）

以下数据在工作流的抓取阶段提取，但**未进入 25 条对抗验证名单**（维度④无存活 claims 的原因），仅作线索记录：

- **npm 周下载量**（api.npmjs.org `point/last-week`，统计窗口 2026-09-20 ~ 2026-09-26，抓取 agent 实测返回）：Vuetify 1,171,106；Element Plus 764,322；PrimeVue 约 94.6 万。
- **社区规模横评**（博客质量，2026-03，[zenn.dev/totoro54gou/articles/d54g-vue-ui-library-comparison](https://zenn.dev/totoro54gou/articles/d54g-vue-ui-library-comparison)）：Vuetify ~40,800 stars / 周下载 ~70 万 / 80+ 组件；PrimeVue ~14,100 / ~36 万 / 90+；shadcn-vue ~5,000 / ~20.4 万 / 50+；Nuxt UI ~6,400 / ~12.8 万 / 125+。该横评未覆盖 Element Plus / Ant Design Vue / Naive UI。
- **第三方供给**：Vue 3 生态存在独立流式 Markdown 渲染器 markstream-vue（渲染未完成的 LLM token 流，支持 Vue 3 / Nuxt / VitePress，内置 Mermaid / KaTeX）——AI chat streaming 能力以独立第三方包形式存在（次级来源，未验证）。

## 附录 C：来源清单（24 个，按质量分级）

### 一手来源（primary）

| 来源 | 角度 | 提取 claims |
|---|---|---|
| [state-of-ai-in-design-systems](https://state-of-ai-in-design-systems.netlify.app) | LLM/Agent 友好性 | 5 |
| [@vuetify/mcp (npm)](https://www.npmjs.com/package/@vuetify/mcp) | LLM/Agent 友好性 | 5 |
| [primevue.dev/llms](https://primevue.dev/llms) | LLM/Agent 友好性 | 5 |
| [shadcn-vue MCP 文档](https://www.shadcn-vue.com/docs/mcp.html) | LLM/Agent 友好性 | 5 |
| [reka-ui.com/llms.txt](https://reka-ui.com/llms.txt) | LLM/Agent 友好性 | 5 |
| [Nuxt UI Chat 文档](https://ui.nuxt.com/docs/components/chat) | AI 原生组件 | 5 |
| [CopilotKit (GitHub)](https://github.com/CopilotKit/CopilotKit) | AI 原生组件 | 5 |
| [ai-sdk.dev (Nuxt)](https://ai-sdk.dev/docs/getting-started/nuxt) | AI 原生组件 | 5 |
| [scrimui.dev](https://scrimui.dev) | AI 原生组件 | 5 |
| [Reka UI styling](https://www.reka-ui.com/docs/styling) | Token 化/无头化 | 5 |
| [shadcn-vue theming](https://www.shadcn-vue.com/docs/theming.html) | Token 化/无头化 | 5 |
| [shadcn-vue dark-mode](https://www.shadcn-vue.com/docs/dark-mode.html) | Token 化/无头化 | 4 |
| [npmtrends（五库对比）](https://npmtrends.com/element-plus-vs-naive-ui-vs-primevue-vs-vuetify-vs-ant-design-vue) | 工程质量/社区 | 5 |
| [api.npmjs.org (element-plus)](https://api.npmjs.org/downloads/point/last-week/element-plus) | 工程质量/社区 | 4 |
| [primevue.org/accessibility（已 404）](https://www.primevue.org/accessibility/) | 工程质量/社区 | 5 |
| [reka-ui.com](https://reka-ui.com/) | 工程质量/社区 | 5 |
| [arXiv 2409.20550](https://arxiv.org/abs/2409.20550) | 反方视角 | 5 |
| [ahrefs.com llmstxt-study](https://ahrefs.com/blog/llmstxt-study) | 反方视角 | 5 |

### 次级 / 博客来源（secondary / blog）

| 来源 | 质量 | 角度 | 提取 claims |
|---|---|---|---|
| [hysenlabs.com](https://hysenlabs.com) | secondary | AI 原生组件 | 5 |
| [zenn.dev Vue3 UI 库横评](https://zenn.dev/articles/vue3-ui-library-comparison-2026) | blog | Token 化/无头化 | 5 |
| [alexop.dev 复合组件](https://alexop.dev/posts/reka-ui-compound-components) | blog | Token 化/无头化 | 5 |
| [seranking.com llms-txt](https://seranking.com/blog/llms-txt/) | blog | 反方视角 | 5 |
| [shadcnstudio.com](https://shadcnstudio.com/blog/set-up-shadcn-vue-vue3-tailwind-v4) | unreliable | Token 化/无头化 | 0 |
| [reddit r/Nuxt](https://www.reddit.com/r/Nuxt/comments/1qaxyl4/ai_elements_vue_a_port_of_vercels_ai_elements_ui) | unreliable | AI 原生组件 | 0 |

---

*本报告由 deep-research 工作流生成（Run ID: wf_d7fb60a1-620），人工整理入库。所有「验证 N-M」票型指对抗验证阶段 N 票支持 / M 票反驳；被否证与未决的 claims 均如实保留（§7、附录 A7-A8），未做美化。*
