# 文档站体验升级 · 实施文档

> **本文档的用途**：把 2026-09 的文档站差距分析落成可执行任务。每个任务自带「背景 / 改动文件白名单 / 分步实施（含参考代码）/ 禁止事项 / 验收清单」。按任务逐个执行、逐个验收，**不要一次做完所有任务再验收**。
>
> **适用读者**：初级工程师（人或 agent）。参考代码可以直接抄，但每一步都要理解后再动手；不理解的地方停下来问，不要凭感觉变通。

---

## 0. 开始之前必须知道的事

### 0.1 先读这两份文件

动手前通读：

1. 根目录 `AGENTS.md`（仓库协作协议，本文与其冲突时以 AGENTS.md 为准）
2. `docs/CONVENTIONS.md` 第 9 节（文档站规约）

### 0.2 本计划的硬性红线

- **只允许改动每个任务「改动文件白名单」里列出的文件**。白名单之外的任何文件（包括 `packages/components/**`、根配置、pnpm-lock.yaml）一律不碰。
- 文档站代码（`apps/docs`）里新增/修改的一切 CSS 视觉值（颜色、字号、间距、圆角、阴影、动效时长）**只能用 `var(--ui-*)` token**，禁止裸值（`#fff`、`13px`、`0.3s` 等）。HTML 属性里的交互参数（如滑杆的 `min`/`max`）不算视觉值。
- 不修改 `packages/components/src/index.ts`（整个计划都不需要动组件包）。
- 每个任务完成后必须运行 §0.3 的门禁命令并**如实记录退出码**。失败就修，禁止跳过、缩小范围或伪造结果；修不动就带着报错原文上报，不要绕。

### 0.3 门禁命令（每个任务完成后必跑）

在仓库根目录执行：

```bash
pnpm -C apps/docs typecheck   # 期望：无输出错误，退出码 0
pnpm docs:build               # 期望：build complete，退出码 0（内含死链检查）
```

涉及页面表现的任务，另起 dev 服务器手测（见各任务验收清单）：

```bash
pnpm docs:dev                 # 默认 5173，被占用会自动换端口，看终端输出
```

**2026-09-25 基线**：以上两条命令在 main 分支当前状态下均为退出码 0。如果你的起点不是绿的，先停下来上报，不要在红基线上开工。

### 0.4 通用工作流

1. 每个任务一个分支或至少一个 commit（`docs: <任务编号+短描述>`），方便单独回滚。
2. 实施步骤里的代码是**参考实现**，语义照抄；如果你的文件内容与「改前」代码对不上（说明仓库已演进），先重新读文件、按同样语义适配，再动手。
3. 验收清单逐项打勾，把勾选结果（和关键截图/命令输出）附在任务汇报里。

---

## 1. 背景：本计划要解决的问题（均为实测确认）

在 `pnpm docs:dev` 起的站点上实测（2026-09-25，vitepress@1.6.4）：

| # | 问题 | 证据 |
|---|------|------|
| P1 | 组件页右侧「本页目录」完全空白，所有小节无法锚点深链 | 组件页 19 个标题里只有 markdown H1 有 `id`；VitePress 的 outline 只收集带 `id` 的标题（`outline.js` 中 `.filter(el => el.id && …)`）。「引入/示例/API/Props/状态与视觉/组件源码」等全部渲染自 Vue 组件、无 id |
| P2 | 本地搜索搜不到组件页正文 | VitePress local search 只对 markdown 源做 `md.render` 建索引，Vue 组件渲染内容不入索引。搜 `loading` 零结果，而 Button 页 DOM 里 loading 随处可见；搜 token 名（如 accent）也搜不到 Token 页 |
| P3 | 「相关组件」不可点击 | Button 页的 IconButton/Form/Dialog/Toast 是纯文本 chip |
| P4 | 404 页是 VitePress 默认英文页 | 访问任意不存在的路径显示 "PAGE NOT FOUND … Take me home" |
| P5 | 「引入」代码块无复制按钮 | markdown 代码块有 VitePress 自带复制，ComponentDoc 自绘的引入块没有 |
| P6 | 站点缺成熟度信号 | 无 editLink / GitHub 图标 / 最后更新时间 / 页脚 |
| P7 | 侧边栏组件名是裸英文标识 | 显示 "Button / ToastHost / Table"；Toast 页 H1 是「Toast 全局提示」但侧边栏叫 "ToastHost" |
| P8 | TokenBoard 只读 | 无复制、无「改一个 token 实时看效果」的演示 |

暂不做（已有明确结论，勿自行展开）：组件页数量补齐（另行排期）、部署/CI、i18n、暗色模式的 token 层设计（见 T11 的前置说明）。

---

## 2. 任务总览与建议顺序

| 编号 | 任务 | 阶段 | 难度 | 规模 | 依赖 |
|------|------|------|------|------|------|
| T1 | 组件页锚点与「本页目录」修复（含 Demo 锚点） | P0 | 低 | S | 无 |
| T2 | 搜索索引接入 meta 与 token | P0 | 中高 | M | 无（与 T1 无依赖） |
| T3 | 「相关组件」自动互链 | P0 | 中 | S | 无 |
| T4 | 「引入」块复制按钮 | P0 | 低 | S | 无 |
| T5 | 自定义中文 404 页 | P0 | 低 | S | 无 |
| T6 | 站点配置包（editLink / socialLinks / lastUpdated / footer） | P1 | 低 | S | 无 |
| T7 | 侧边栏中文名 | P1 | 低 | S | 无 |
| T8 | TokenBoard 一键复制 | P1 | 低 | S | 无 |
| T9 | Token 实验器（改 token 实时预览） | P1 | 中 | M | T8（同一文件，先做 T8） |
| T10 | ApiTables 行锚点 + 契约版本标注 | P2 | 低 | S | T1（id 风格统一后再做） |
| T11 | 暗色模式接入 | P2 | — | — | **被 token 层阻塞，见任务内说明，当前不要实施** |

阶段内顺序可调；建议按编号做。T1–T5 完成后站点可交互性问题全部闭环。

---

## T1 · 组件页锚点与「本页目录」修复（含 Demo 锚点）

### 背景

见 §1 P1。VitePress 的页面目录（outline）与锚点跳转都依赖标题元素的 `id`；组件页的所有小节标题由 Vue 组件渲染，全部没有 id。修复方式：给这些标题补上**固定英文小写 id**，并给每个 Demo 的根元素加可选锚点。

### 改动文件白名单

- `apps/docs/.vitepress/theme/components/ComponentDoc.vue`
- `apps/docs/.vitepress/theme/components/MetaIntent.vue`
- `apps/docs/.vitepress/theme/components/ApiTables.vue`
- `apps/docs/.vitepress/theme/components/MetaStates.vue`
- `apps/docs/.vitepress/theme/components/MetaNotes.vue`
- `apps/docs/.vitepress/theme/components/MetaComposition.vue`
- `apps/docs/.vitepress/theme/components/AgentHints.vue`
- `apps/docs/.vitepress/theme/components/SourceViewer.vue`
- `apps/docs/.vitepress/theme/components/Demo.vue`
- `apps/docs/src/zh/components/general/button.md`
- `apps/docs/src/zh/components/data/table.md`
- `apps/docs/src/zh/components/feedback/toast.md`

### 实施步骤

**第 1 步：给标题加 id。** 按下表逐个文件修改（只加 `id` 属性，**不改标题文字、不改标签层级**）：

| 文件 | 改前 | 改后 |
|------|------|------|
| MetaIntent.vue | `<h2>何时使用</h2>` | `<h2 id="usage">何时使用</h2>` |
| MetaIntent.vue | `<h3>适用场景</h3>` | `<h3 id="usage-when">适用场景</h3>` |
| MetaIntent.vue | `<h3>避免使用</h3>` | `<h3 id="usage-when-not">避免使用</h3>` |
| ComponentDoc.vue | `<h2>引入</h2>` | `<h2 id="import">引入</h2>` |
| ComponentDoc.vue | `<h2>示例</h2>` | `<h2 id="examples">示例</h2>` |
| ApiTables.vue | `<h2>API</h2>` | `<h2 id="api">API</h2>` |
| ApiTables.vue | `<h3>Props</h3>` | `<h3 id="api-props">Props</h3>` |
| ApiTables.vue | `<h3>Slots</h3>` | `<h3 id="api-slots">Slots</h3>` |
| ApiTables.vue | `<h3>Events</h3>` | `<h3 id="api-events">Events</h3>` |
| ApiTables.vue | `<h3>Expose</h3>` | `<h3 id="api-exposes">Expose</h3>` |
| MetaStates.vue | `<h2>状态与视觉</h2>` | `<h2 id="states">状态与视觉</h2>` |
| MetaNotes.vue | `<h2>注意事项</h2>` | `<h2 id="notes">注意事项</h2>` |
| MetaComposition.vue | `<h2>组合与相关组件</h2>` | `<h2 id="composition">组合与相关组件</h2>` |
| AgentHints.vue | `<h2>给 AI / Agent 的使用提示</h2>` | `<h2 id="agent">给 AI / Agent 的使用提示</h2>` |
| SourceViewer.vue | `<h2>组件源码</h2>` | `<h2 id="source">组件源码</h2>` |

**注意**：AgentHints 内部 `<details>` 里的 `<h3>选型提示 / 常见任务 / 生成注意</h3>` **不要加 id**——它们在折叠区里，进了目录反而干扰。

**第 2 步：Demo 支持锚点。** `Demo.vue`：

改前：

```ts
const props = defineProps<{
  /** demo 源码（由页面以 `xxx.vue?raw` 导入后传入，保证预览与源码同源） */
  src: string
  /** 语法高亮语言（shiki lang id），demo 默认 vue */
  lang?: string
  title?: string
  description?: string
}>()
```

改后（新增一个可选属性）：

```ts
const props = defineProps<{
  /** demo 源码（由页面以 `xxx.vue?raw` 导入后传入，保证预览与源码同源） */
  src: string
  /** 语法高亮语言（shiki lang id），demo 默认 vue */
  lang?: string
  title?: string
  description?: string
  /** 小节锚点（ASCII 小写、连字符分隔），传入后可通过 #<anchor> 直达该示例 */
  anchor?: string
}>()
```

模板根元素：

```html
<!-- 改前 -->
<section class="ui-docs-demo">
<!-- 改后 -->
<section :id="anchor || undefined" class="ui-docs-demo">
```

**第 3 步：三个组件页的每个 `<Demo>` 加 `anchor`。** 命名规则：全小写 ASCII、连字符分隔、能表意。参考：

- `button.md`：`basic` / `sizes` / `states` / `icons` / `group`
- `table.md`：`basic` / `cells` / `sortable` / `async-states`
- `toast.md`：`basic` / `manual`

示例：

```html
<Demo title="基础用法" anchor="basic" description="…" :src="basicSrc">
```

### 禁止事项

- 不要改任何标题的文字、层级（h2↔h3）、顺序。
- 不要使用中文或大写字母做 id（VitePress 对中文 id 的处理与 markdown 生成规则不一致，混用会出双锚点）。
- 不要动 `<style>` 部分（本任务不需要任何样式改动）。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0
- [ ] `pnpm docs:build` 退出码 0
- [ ] dev 起服务，打开 `/components/general/button`：右侧「本页目录」出现「何时使用 / 引入 / 示例 / API / Props / Slots / Events / Expose / 状态与视觉 / 注意事项 / 组合与相关组件 / 给 AI / Agent 的使用提示 / 组件源码」；点击任意条目页面滚动到位且地址栏出现 `#api-props` 这类 hash
- [ ] 直接访问 `/components/general/button#api-props`：刷新后页面停在 Props 表
- [ ] 访问 `/components/general/button#states` 能定位到「状态与视觉」；`/components/general/button#icons` 能定位到「图标」示例
- [ ] 打开 `/guide/theming`：目录仍正常（#引入 / #三层结构…），指南页不受影响

---

## T2 · 搜索索引接入 meta 与 token（修复「搜不到组件页正文」）

### 背景

见 §1 P2。VitePress local search 的索引只来自 `md.render(markdown 源)`（`localSearchPlugin` 的默认 `render()`），Vue 组件渲染的 API 表 / 状态 / demo 描述 / TokenBoard 全部不入索引。

**方案**（已对照 vitepress@1.6.4 源码验证可行）：接管 `themeConfig.search.options._render` 钩子。它在 **Node 侧**（dev server / build 进程）被调用，我们在它返回的 html 末尾追加一段「仅供搜索」的文本（从组件 meta 源文件与 `paper.css` 提取），该 html 只用于建索引，页面实际渲染不走这条路径，所以页面 DOM 不受任何影响。

两个已验证的关键事实（升级 vitepress 时必须回归，见附录 B）：

1. `localSearchPlugin` 读取 `options._render` 的优先级高于默认渲染，且接管后要自己处理 `frontmatter.search === false`。
2. VitePress 把 themeConfig 序列化给浏览器时，`serializeFunctions` **跳过所有下划线开头的 key**——`_render` 函数不会（也不能）进客户端包。

### 改动文件白名单

- `apps/docs/.vitepress/sidebar.ts`（只新增一个导出函数）
- `apps/docs/.vitepress/search-extra.ts`（**新建**）
- `apps/docs/.vitepress/config.ts`（只改 `search` 一段）

### 实施步骤

**第 1 步：`sidebar.ts` 抽出 meta 路径计算（供两处共用）。**

在 `sidebar.ts` 现有 `pascalize` / `PRIMARY_META` / `COMPONENTS_SRC` 之后新增导出：

```ts
/** 目录名 → 主 meta 文件绝对路径（侧边栏扫描与搜索语料提取共用） */
export function metaPathForDir(dir: string): string {
  const metaFile = PRIMARY_META[dir] ?? `${pascalize(dir)}.meta.ts`
  return join(COMPONENTS_SRC, dir, metaFile)
}
```

并把 `scanComponents()` 里现有的

```ts
const metaFile = PRIMARY_META[dir.name] ?? `${pascalize(dir.name)}.meta.ts`
const metaPath = join(COMPONENTS_SRC, dir.name, metaFile)
```

替换为 `const metaPath = metaPathForDir(dir.name)`（消除重复；`buildSidebar` 行为不变）。

**第 2 步：新建 `search-extra.ts`**，内容如下（整文件照抄）：

```ts
/**
 * search-extra.ts —— 本地搜索索引扩展（仅 Node 侧，只允许被 config.ts 引入）。
 *
 * VitePress local search 默认只索引 markdown 渲染结果；组件页的 API 表 /
 * 状态说明与 Token 页的 TokenBoard 由 Vue 组件渲染，均不入索引。本模块
 * 接管 _render 钩子，在索引用 html 末尾追加从组件 meta 源码与 paper.css
 * 提取的搜索语料。该 html 只进 MiniSearch 索引，页面渲染不走此路径。
 *
 * 注意：_render 是 vitepress 未文档化的内部钩子（1.6.4 已验证）；
 * 升级 vitepress 后必须回归验收项。下划线 key 不会被序列化进客户端。
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'
import { metaPathForDir } from './sidebar'

const DOCS_ROOT = fileURLToPath(new URL('../', import.meta.url))
const PAPER_CSS_PATH = resolve(DOCS_ROOT, '../../packages/tokens/src/paper.css')

/** 组件页路径：components/<category>/<dir>.md */
const COMPONENT_PAGE_RE = /^components\/[a-z-]+\/([a-z-]+)\.md$/
const TOKENS_PAGE = 'tokens/index.md'

/** 页面 env 中本函数用到的字段（与 VitePress 内部结构保持兼容的最小声明） */
interface PageEnv {
  relativePath?: string
  frontmatter?: Record<string, unknown>
}

/** 极小 markdown 渲染器接口（结构类型，避免依赖 vitepress 内部类型） */
interface MdLike {
  render(src: string, env: unknown): string
}

/** LocalSearchOptions 公开类型未声明内部钩子 _render，用交叉类型补齐（无需断言） */
type SearchOptionsWithHook = DefaultTheme.LocalSearchOptions & {
  _render: (src: string, env: PageEnv, md: MdLike) => string
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * 从 meta 源码提取全部单引号字符串作为语料：覆盖 props/slots/events 的
 * 名称、类型、默认值、描述与 states/agent 提示。meta 是纯数据对象
 * （仅 import type），此提取稳定；若未来 meta 引入运行时字符串拼接，需回归。
 */
function searchableTextFromMeta(dir: string): string {
  const metaPath = metaPathForDir(dir)
  if (!existsSync(metaPath)) return ''
  const source = readFileSync(metaPath, 'utf8')
  const values = new Set<string>()
  for (const match of source.matchAll(/'([^'\n]+)'/g)) values.add(match[1])
  return Array.from(values).join('\n')
}

/** 从 paper.css 提取全部 --ui-* 声明行（token 名与值都可被搜到） */
function searchableTextFromTokens(): string {
  const source = readFileSync(PAPER_CSS_PATH, 'utf8')
  return source
    .split('\n')
    .filter(line => /^\s*--ui-[a-z0-9-]+\s*:/.test(line))
    .map(line => line.trim().replace(/;$/, ''))
    .join('\n')
}

function buildExtraHtml(relativePath: string): string {
  let text = ''
  const componentPage = relativePath.match(COMPONENT_PAGE_RE)
  if (componentPage) {
    text = searchableTextFromMeta(componentPage[1])
  } else if (relativePath === TOKENS_PAGE) {
    text = searchableTextFromTokens()
  }
  if (!text) return ''
  return `\n<div class="vp-search-index-extra">${escapeHtml(text)}</div>`
}

/**
 * VitePress _render 钩子：复刻默认行为（含 frontmatter.search === false
 * 短路），再按页面类型追加搜索语料。
 */
export function renderForSearch(src: string, env: PageEnv, md: MdLike): string {
  const html = md.render(src, env)
  if (env.frontmatter?.search === false) return ''
  return html + buildExtraHtml(env.relativePath ?? '')
}

/** 组装 themeConfig.search.options 的完整对象（含现有中文翻译） */
export function buildLocalSearchOptions(): SearchOptionsWithHook {
  return {
    translations: {
      button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
      modal: {
        noResultsText: '无法找到相关结果',
        resetButtonTitle: '清除查询条件',
        footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
      },
    },
    _render: renderForSearch,
  }
}
```

**第 3 步：`config.ts` 接线。**

改前（`themeConfig.search` 段）：

```ts
search: {
  provider: 'local',
  options: {
    translations: {
      button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
      modal: {
        noResultsText: '无法找到相关结果',
        resetButtonTitle: '清除查询条件',
        footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
      },
    },
  },
},
```

改后（文件顶部补充 import）：

```ts
import { buildLocalSearchOptions } from './search-extra'
```

（`search` 段替换为）：

```ts
search: {
  provider: 'local',
  // _render 为内部钩子，其类型已在 search-extra.ts 用交叉类型补齐，
  // 此处直接赋值即可、无需断言；下划线 key 不会被序列化进客户端。
  options: buildLocalSearchOptions(),
},
```

### 禁止事项

- `search-extra.ts` **只能被 `config.ts` 引入**（Node 侧）。禁止从 theme 组件（浏览器侧）import 它，否则会把 node:fs 带进客户端包。
- 不要给 `options` 添加 `miniSearch.options`（改变分词/字段会影响客户端与 Node 两侧索引一致性的约定，超出本任务范围）。
- 不要把语料追加进真实页面（不要改任何 `.md` 来「顺便」解决搜索）。

### 已知限制（如实告知，不需修）

- dev 模式下索引随 **md 文件** 变更热更；只改 meta / paper.css 不会自动重建索引，**重启 dev 即可**。
- `_render` 为内部钩子：升级 vitepress 版本后必须重跑本任务验收（写进发布前回归，见附录 B）。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0
- [ ] `pnpm docs:build` 退出码 0
- [ ] dev 起服务，搜索 `loading`：出现 Button 页结果（摘要里能看到 loading 相关 props 文案）
- [ ] 搜索 `aria-busy`：出现 Button 页结果（来自 meta 的 props 描述）
- [ ] 搜索 `accent`：出现「设计 Token」页结果（来自 paper.css 的 `--ui-accent` 行）
- [ ] 搜索中文（如 `表格`）仍正常
- [ ] 在 Button 页打开浏览器控制台执行 `document.querySelectorAll('.vp-search-index-extra').length`，结果为 `0`（确认语料只进索引、没进页面）
- [ ] `/tokens/` 页面视觉与改前一致（TokenBoard 未被影响）

---

## T3 · 「相关组件」自动互链

### 背景

见 §1 P3。Button 页「相关组件」的 IconButton / Form / Dialog / Toast 目前是纯文本 chip。目标：**凡已有文档页的组件名渲染为链接，其余保持文本**。「是否已有文档页」在构建期由 `import.meta.glob` 静态判定，不引入运行时 fs。

### 改动文件白名单

- `apps/docs/.vitepress/theme/components/MetaComposition.vue`

### 实施步骤

**第 1 步：script 增加链接表。** 在 `const props = …` 之后加入：

```ts
interface MetaModule { meta: ComponentDefinition }

// 构建期静态扫描：全部组件 meta（identity.name/category）与已交付的文档页
const metaModules = import.meta.glob<MetaModule>('@comp-src/**/*.meta.ts', { eager: true })
const pageKeys = Object.keys(import.meta.glob('../../../src/zh/components/**/*.md'))

/** 已有文档页的目录名集合（glob key 形态不保证前缀，统一用后缀匹配） */
const documentedDirs = new Set(
  pageKeys
    .map(key => key.match(/\/components\/([a-z-]+)\/([a-z-]+)\.md$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map(m => m[2]),
)

/** 展示名 → 文档页路径；仅登记已有文档页的组件（避免死链：build 对内部死链直接失败） */
const LINKS = new Map<string, string>()
for (const [metaPath, mod] of Object.entries(metaModules)) {
  const meta = (mod as MetaModule).meta
  if (!meta) continue
  const dir = metaPath.split('/').at(-2) ?? ''
  if (!documentedDirs.has(dir)) continue
  LINKS.set(meta.identity.name, `/components/${meta.identity.category}/${dir}`)
}

/** 相关组件文案与 meta identity.name 不一致的别名（新增此类组件时在此登记） */
const NAME_ALIASES: Record<string, string> = {
  Toast: 'ToastHost',
}

function linkFor(name: string): string | undefined {
  return LINKS.get(NAME_ALIASES[name] ?? name)
}
```

**第 2 步：模板 chip 改为条件链接。**

改前：

```html
<span v-for="name in props.composition.related" :key="name" class="ui-docs-comp__chip">{{ name }}</span>
```

改后：

```html
<template v-for="name in props.composition.related" :key="name">
  <a v-if="linkFor(name)" :href="linkFor(name)" class="ui-docs-comp__chip ui-docs-comp__chip--link">{{ name }}</a>
  <span v-else class="ui-docs-comp__chip">{{ name }}</span>
</template>
```

**第 3 步：样式（加在 `<style scoped>` 末尾，视觉值全部走 token）。**

```css
.ui-docs-comp__chip--link {
  text-decoration: none;
  color: var(--ui-accent);
  border-color: var(--ui-accent-soft);
  transition: border-color var(--ui-motion-fast) var(--ui-ease-out),
    background var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-comp__chip--link:hover {
  background: var(--ui-accent-soft);
}
```

### 禁止事项

- 不要把 `patterns` / `preferred` 列表也改成链接（它们是中文句子/约定，不是组件名）。
- 不要为了「都能点」去链接没有文档页的组件——那会让 `pnpm docs:build` 因死链失败，这是设计好的安全网。
- 新增别名只放 `NAME_ALIASES`，不要改组件包 meta 的 `identity.name`（公共契约）。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0
- [ ] `pnpm docs:build` 退出码 0（死链检查通过）
- [ ] Button 页「相关组件」：**Toast**（已有文档页）渲染为链接，点击跳转 `/components/feedback/toast`；IconButton / Form / Dialog 仍为纯文本 chip（尚无文档页，属预期）
- [ ] hover 链接 chip 有浅色底反馈；键盘 Tab 可聚焦、Enter 可跳转、焦点环可见
- [ ] Toast 页与 Table 页的对应区块渲染正常、无控制台报错

---

## T4 · 「引入」块复制按钮

### 背景

见 §1 P5。markdown 代码块自带 VitePress 复制按钮，但 `ComponentDoc.vue` 自绘的「引入」块没有。实现与 `Demo.vue` 的复制按钮同款交互。

### 改动文件白名单

- `apps/docs/.vitepress/theme/components/ComponentDoc.vue`

### 实施步骤

**第 1 步：script 增加复制状态与函数**（与 Demo.vue 同款语义）：

```ts
import { ref } from 'vue'

const copied = ref(false)

async function copyImport(): Promise<void> {
  try {
    await navigator.clipboard.writeText(
      `import { ${props.meta.identity.export} } from '${props.meta.identity.package}'`,
    )
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // 剪贴板不可用（非安全上下文等）时静默降级：代码本身可见，可手动复制
  }
}
```

**第 2 步：模板「引入」区加按钮。**

改前：

```html
<h2 id="import">引入</h2>
<div class="ui-docs-pagedoc__import">
  <code>import { {{ props.meta.identity.export }} } from '{{ props.meta.identity.package }}'</code>
</div>
```

改后：

```html
<h2 id="import">引入</h2>
<div class="ui-docs-pagedoc__import">
  <code>import { {{ props.meta.identity.export }} } from '{{ props.meta.identity.package }}'</code>
  <button type="button" class="ui-docs-pagedoc__copy" @click="copyImport">
    {{ copied ? '已复制' : '复制' }}
  </button>
</div>
```

（若 T1 未合并导致 h2 还没有 `id="import"`，按你手上的文件实际内容对齐即可。）

**第 3 步：样式。** `.ui-docs-pagedoc__import` 增加 `display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-3);`，并新增：

```css
.ui-docs-pagedoc__copy {
  flex-shrink: 0;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: transparent;
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-color-paper);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-pagedoc__copy:hover {
  color: var(--ui-surface);
  border-color: var(--ui-color-paper);
}
```

（复制按钮位于深底 `--ui-color-ink-950` 上，故用 paper/surface 系前景，保持与整块视觉一致。）

### 禁止事项

- 不要改动「引入」代码文本本身的生成方式（仍以 meta.identity 为唯一来源）。
- 不要引入第三方剪贴板库；`navigator.clipboard` + 静默降级是既定模式（Demo.vue 先例）。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0、`pnpm docs:build` 退出码 0
- [ ] Button 页点击「复制」，剪贴板内容为 `import { Button } from '@ui/components'`，按钮文案短暂变「已复制」后复原
- [ ] Toast 页复制内容为 `import { ToastHost } from '@ui/components'`（以 meta 为准）
- [ ] 窄屏（浏览器 devtools 375px 宽）下引入块不溢出，长代码横向滚动、按钮保持可见

---

## T5 · 自定义中文 404 页

### 背景

见 §1 P4。VitePress 默认主题支持 `404.md`：放在 srcDir 根部即自动成为未匹配路由的落地页（已对照 vitepress@1.6.4 的 `notFoundPageData` 回退逻辑确认）。纯新增文件，无配置改动。

### 改动文件白名单

- `apps/docs/src/zh/404.md`（**新建**）

### 实施步骤

新建 `apps/docs/src/zh/404.md`，内容：

```markdown
---
title: 404
---

<script setup>
import { useData } from 'vitepress'

const { site } = useData()
</script>

# 404

这一页不在纸面上——可能已被移动或删除。

- 回到[首页](/)
- 去[快速开始](/guide/quickstart)
- 浏览[组件文档](/components/general/button)

<code>{{ site.title }}</code>
```

（若不需要引用站点标题，可删掉 `<script setup>` 与 `<code>` 行，保留纯 markdown。）

### 禁止事项

- 不要改 `config.ts`（404.md 是约定路径，无需注册）。
- 链接必须指向**已存在**的页面（首页 / quickstart / button 页），否则 build 死链失败。

### 验收清单

- [ ] `pnpm docs:build` 退出码 0
- [ ] dev 下访问 `/no-such-page` 与 `/components/inputs/nothing`：均显示中文 404 页，三个链接可点且到达正确页面
- [ ] 访问存在的页面不受影响

---

## T6 · 站点配置包（editLink / socialLinks / lastUpdated / footer）

### 背景

见 §1 P6。四项均为 VitePress 一行级配置，当前全缺。

### 改动文件白名单

- `apps/docs/.vitepress/config.ts`

### 实施步骤

在 `config.ts`：

**1）顶层新增**（与 `appearance` 同级）：

```ts
lastUpdated: true,
```

**2）`themeConfig` 内新增**（放在 `returnToTopLabel` 之后、`search` 之前；中文文案与现有风格一致）：

```ts
lastUpdated: {
  text: '最后更新',
  formatOptions: { dateStyle: 'short', timeStyle: 'short' },
},
editLink: {
  pattern: 'https://github.com/new1333/ai-native-vue-design/edit/main/apps/docs/src/zh/:path',
  text: '在 GitHub 上编辑此页',
},
socialLinks: [
  { icon: 'github', link: 'https://github.com/new1333/ai-native-vue-design' },
],
footer: {
  message: '纸面 Paper · 为 AI 协作而设计的 Vue 3 组件库',
  copyright: '开发阶段 · 许可证待定',
},
```

说明（写进汇报，不要自行变更）：

- `editLink.pattern` 中的 `:path` 会被替换为页面相对 `srcDir` 的路径；`srcDir = apps/docs/src/zh`，因此 URL 前缀必须是 `.../edit/main/apps/docs/src/zh/`。
- footer 文案中「许可证待定」是如实描述：仓库当前未声明 LICENSE。**许可证由维护者决定，不要自行填写 MIT/Apache 之类。**
- `lastUpdated` 的时间来自 git 提交记录；未提交过的新文件显示构建时间，属正常。

### 禁止事项

- 不要动 `appearance: false`（暗色 Profile 未交付前开启会造成半深色页面，见 T11）。
- 不要改 nav / sidebar / outline / search 的既有配置。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0、`pnpm docs:build` 退出码 0
- [ ] 导航栏右上出现 GitHub 图标，点击新开标签页到达仓库
- [ ] 任意文档页底部出现「在 GitHub 上编辑此页」，链接指向对应 md 文件的 edit 地址（抽 1 个指南页 + 1 个组件页核对）
- [ ] 页面底部出现「最后更新」时间（有 git 历史的页面显示提交时间）
- [ ] 首页与文档页底部出现页脚文案

---

## T7 · 侧边栏中文名

### 背景

见 §1 P7。侧边栏当前直接用 meta 的 `identity.name`（"Button / ToastHost / Table"），无中文名且 Toast 暴露内部导出名。**单一事实来源方案**：每个组件页 md 的 frontmatter 都有 `title`（如 `title: Toast 全局提示`），侧边栏直接读它，缺失时回退 identity.name。不改组件包 meta（公共契约）。

### 改动文件白名单

- `apps/docs/.vitepress/sidebar.ts`

### 实施步骤

**1）新增工具函数**（放在 `scanComponents` 附近）：

```ts
/** 从页面 md 的 frontmatter 读取 title（侧边栏展示名）；缺失时回退 meta 名 */
function pageTitle(pagePath: string, fallback: string): string {
  const match = readFileSync(pagePath, 'utf8').match(/^title:\s*(.+)$/m)
  return match ? match[1].trim() : fallback
}
```

**2）让扫描结果携带展示名。** `ComponentEntry` 增加字段：

```ts
interface ComponentEntry {
  dir: string
  name: string
  category: string
  label: string   // 侧边栏展示名：页面 frontmatter title 优先
}
```

`buildSidebar` 循环里，页面存在性检查之后：

```ts
const label = pageTitle(pagePath, entry.name)
```

把 `list.push(entry)` 改为 `list.push({ ...entry, label })`。

**3）侧边栏项使用 label**：

```ts
items: (byCategory.get(key) ?? []).map(({ dir, label, category }) => ({
  text: label,
  link: `/components/${category}/${dir}`,
})),
```

### 禁止事项

- 不要改 `packages/components` 里任何 meta 的 `identity.name`。
- 不要在 sidebar.ts 里手写一份「中文名映射表」——frontmatter title 才是唯一来源（新页面写上 title 即自动生效）。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0、`pnpm docs:build` 退出码 0
- [ ] 侧边栏显示「Button 按钮 / Toast 全局提示 / Table 表格」，与各页 H1 一致
- [ ] 分类分组（通用 / 数据 / 反馈）与顺序不变
- [ ] 若未来某新页面忘了写 frontmatter title，侧边栏回退显示英文组件名而非报错（可用临时页面验证后删除）

---

## T8 · TokenBoard 一键复制

### 背景

见 §1 P8。Token 总览页每张卡片只有名称与值，复制 token 需要手动框选。为每张卡片加复制按钮，复制内容为 `var(--ui-xxx)`（可直接粘进 CSS 的形态）。

### 改动文件白名单

- `apps/docs/.vitepress/theme/components/TokenBoard.vue`

### 实施步骤

**1）script 增加复制状态**（`isColor` 函数之后）：

```ts
import { computed, ref } from 'vue'

const copiedName = ref('')
let copiedTimer: number | undefined

async function copyToken(name: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(`var(${name})`)
    copiedName.value = name
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => {
      copiedName.value = ''
    }, 1500)
  } catch {
    // 剪贴板不可用时静默降级：token 名本身可见，可手动复制
  }
}
```

（`computed` 原已导入则合并到既有 import。）

**2）模板卡片加按钮**。`<li>` 内末尾追加：

```html
<button
  type="button"
  class="ui-docs-tokens__copy"
  :aria-label="`复制 ${entry.name}`"
  @click="copyToken(entry.name)"
>
  {{ copiedName === entry.name ? '已复制' : '复制' }}
</button>
```

**3）样式**（全部 token 值）：

```css
.ui-docs-tokens__item {
  /* 既有样式保持不变，追加： */
  position: relative;
}

.ui-docs-tokens__copy {
  position: absolute;
  top: var(--ui-space-2);
  right: var(--ui-space-2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xs);
  background: var(--ui-surface);
  padding: var(--ui-space-1) var(--ui-space-2);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out),
    border-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-tokens__copy:hover {
  color: var(--ui-text-1);
  border-color: var(--ui-border-strong);
}
```

（若 `.ui-docs-tokens__item` 已有 `position` 声明则不重复添加。）

### 禁止事项

- 复制内容必须是 `var(--ui-xxx)` 完整形态，不是裸 token 名。
- 不要用整卡可点击代替按钮（卡片含文本选择等交互，按钮语义 + aria-label 才是无障碍正确做法）。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0、`pnpm docs:build` 退出码 0
- [ ] Token 页任意色卡点击「复制」，剪贴板为 `var(--ui-accent)` 形态；按钮变「已复制」1.5s 后复原
- [ ] 连续点击两张不同卡片，仅最后一张显示「已复制」
- [ ] 键盘可 Tab 到复制按钮，焦点环可见

---

## T9 · Token 实验器（改一个 token 实时预览）

### 背景

「token 驱动」是本库核心卖点，但目前没有任何交互演示。在 Token 页提供一个实验器：调整 3 个关键 token（`--ui-accent`、`--ui-accent-soft`、`--ui-radius-md`），**预览区内**的真实组件即时变化，重置可恢复。预览区通过 inline style 覆盖 token 作用域，页面其他区域不受影响。

### 改动文件白名单

- `apps/docs/.vitepress/theme/components/TokenPlayground.vue`（**新建**）
- `apps/docs/.vitepress/theme/index.ts`（注册全局组件，追加一行）
- `apps/docs/src/zh/tokens/index.md`（使用组件）

### 实施步骤

**1）新建 `TokenPlayground.vue`**（整文件参考实现）：

```vue
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Button, Input, Progress, Switch } from '@ui/components'

/**
 * Token 实验器：在预览容器上以 inline style 覆盖少量 --ui-* 变量，
 * 用真实组件即时呈现效果。仅作用于预览区（CSS 自定义属性继承作用域），
 * 页面其余部分不受影响；初始值在 onMounted 读取，重置即恢复。
 */
interface TokenState {
  accent: string
  accentSoft: string
  radius: string
}

const initial = reactive<TokenState>({ accent: '', accentSoft: '', radius: '' })
const current = reactive<TokenState>({ accent: '', accentSoft: '', radius: '' })

const ready = computed(() => initial.accent !== '')

onMounted(() => {
  const styles = getComputedStyle(document.documentElement)
  initial.accent = styles.getPropertyValue('--ui-accent').trim()
  initial.accentSoft = styles.getPropertyValue('--ui-accent-soft').trim()
  initial.radius = styles.getPropertyValue('--ui-radius-md').trim()
  reset()
})

function reset(): void {
  current.accent = initial.accent
  current.accentSoft = initial.accentSoft
  current.radius = initial.radius
}

const previewStyle = computed<Record<string, string>>(() => ({
  '--ui-accent': current.accent,
  '--ui-accent-soft': current.accentSoft,
  '--ui-radius-md': current.radius,
}))

const keyword = ref('token 预览')
const autoSync = ref(true)
</script>

<template>
  <section class="ui-docs-playground">
    <div class="ui-docs-playground__controls">
      <label class="ui-docs-play__field">
        <span>--ui-accent</span>
        <input v-model="current.accent" type="color" :disabled="!ready" />
      </label>
      <label class="ui-docs-play__field">
        <span>--ui-accent-soft</span>
        <input v-model="current.accentSoft" type="color" :disabled="!ready" />
      </label>
      <label class="ui-docs-play__field">
        <span>--ui-radius-md</span>
        <input v-model="current.radius" type="range" min="0" max="16" step="1" :disabled="!ready" />
        <code>{{ current.radius }}</code>
      </label>
      <Button size="sm" :disabled="!ready" @click="reset">重置</Button>
    </div>

    <div :style="previewStyle" class="ui-docs-playground__preview">
      <Button variant="primary">主要动作</Button>
      <Button>常规动作</Button>
      <Input v-model="keyword" placeholder="输入点东西" />
      <label class="ui-docs-play__switch">
        <Switch v-model="autoSync" />
        <span>自动同步</span>
      </label>
      <Progress :value="72" />
    </div>
  </section>
</template>

<style scoped>
.ui-docs-playground {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  padding: var(--ui-space-4);
}

.ui-docs-playground__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--ui-space-4);
  margin-bottom: var(--ui-space-5);
}

.ui-docs-play__field {
  display: grid;
  gap: var(--ui-space-1);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  font-family: var(--vp-font-family-mono);
}

.ui-docs-play__field input[type='color'] {
  width: var(--ui-space-8);
  height: var(--ui-space-6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xs);
  background: var(--ui-surface);
  padding: 0;
}

.ui-docs-play__field input[type='range'] {
  accent-color: var(--ui-accent);
}

.ui-docs-playground__preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
  border: 1px dashed var(--ui-border-strong);
  border-radius: var(--ui-radius-md);
  padding: var(--ui-space-5);
}

.ui-docs-play__switch {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}
</style>
```

**注意**：代码中用到的 `--ui-space-8`、`--ui-space-6` 已确认存在于 paper.css。若你实施时调整了间距 token，只允许换成其他已存在的 `--ui-space-*`（Token 总览页可查），**不要写裸像素值**。

**2）`theme/index.ts` 注册**：import + `app.component('TokenPlayground', TokenPlayground)`（照 `TokenBoard` 的既有写法各加一行）。

**3）`tokens/index.md`**：在 `<TokenBoard />` 之后追加一节：

```markdown
## 亲手试试

改一个 token，看真实组件的反应（只影响下方预览区）：

<TokenPlayground />
```

### 禁止事项

- 实验器只允许覆盖**这 3 个** token；不要扩成「全站换肤」（暗色/全站 Profile 属 T11 与 token 层，不要越界）。
- 初始值读取（`getComputedStyle`）必须在 `onMounted` 内；script 顶层禁止访问 `document`。
- 不写裸视觉值；滑杆 `min`/`max` 是交互参数，允许。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0、`pnpm docs:build` 退出码 0
- [ ] Token 页出现「亲手试试」区；改 `--ui-accent` 颜色 → 预览区 Button(primary)/Switch/Progress 立即变色，**页面其他区域（导航、目录、TokenBoard）不变色**
- [ ] 拖动 radius 滑杆 → 预览区按钮/输入框圆角即时变化
- [ ] 点「重置」恢复初始值；刷新页面后也恢复（无持久化，符合预期）
- [ ] 键盘可操作所有控件，焦点环可见

---

## T10 · ApiTables 行锚点 + 契约版本标注

### 背景

API 表行无法深链（不能把 `#props-loading` 发给同事或 AI）；meta 的 `identity.version`（契约版本）从未展示。本任务：表格行加锚点、引入区标注契约版本。**不新增 meta 字段**（类型跳转、逐行 since 标注需要扩展 meta 契约，属提案，见暂缓清单）。

### 改动文件白名单

- `apps/docs/.vitepress/theme/components/ApiTables.vue`
- `apps/docs/.vitepress/theme/components/ComponentDoc.vue`

### 实施步骤

**1）ApiTables 四张表的行加 id**（以 Props 为例，其余三表同构）：

```html
<tr v-for="item in props.api.props" :key="item.name" :id="`prop-${item.name}`">
```

Slots → `slot-${item.name}`；Events → `event-${item.name}`；Expose → `expose-${item.name}`。

**2）名称列加锚点链接**（仅 Props 表示例；其它表同理）：

```html
<td>
  <a :href="`#prop-${item.name}`" class="ui-docs-api__anchor" :aria-label="`锚点 ${item.name}`">#</a>
  <code>{{ item.name }}</code>
  <span v-if="item.required" class="ui-docs-api__required">必填</span>
</td>
```

样式（token 值）：

```css
.ui-docs-api__anchor {
  margin-right: var(--ui-space-2);
  color: var(--ui-text-3);
  text-decoration: none;
}

.ui-docs-api__anchor:hover {
  color: var(--ui-accent);
}

tr:target {
  /* 命中锚点的行高亮一屏内可辨（id 挂在 tr 上，td 背景透明可透出行底色） */
  background: var(--ui-accent-soft);
}
```

**3）ComponentDoc 的引入区标注契约版本**：

```html
<p class="ui-docs-pagedoc__version">契约版本 v{{ props.meta.version }}</p>
```

样式：`font-size: var(--ui-text-xs); color: var(--ui-text-3); margin: var(--ui-space-1) 0 0;`，放在「引入」块下方。

### 禁止事项

- 不要给 meta 新增 `since` 字段或修改 `shared/meta.ts`（契约变更需升级流程）。
- 行 id 前缀保持 `prop- / slot- / event- / expose-`，不要用中文。

### 验收清单

- [ ] `pnpm -C apps/docs typecheck` 退出码 0、`pnpm docs:build` 退出码 0
- [ ] Button 页点 loading 行的 `#`：地址栏变为 `#prop-loading` 且行背景高亮；直接访问带该 hash 的 URL 同样高亮定位
- [ ] 「引入」区下方显示「契约版本 v0.1.0」（以 meta 实际值为准）

---

## T11 · 暗色模式接入（**当前不要实施**）

### 状态：被 token 层阻塞

文档站无暗色模式的根因不在文档站：`@ui/tokens` 目前只有浅色 `paper` Profile（`config.ts` 中 `appearance: false` 的注释即此意）。**在深色 Profile 交付前开启 appearance 会得到半深色、不可用的页面。**

分两步，本计划只描述边界：

- **T11-A（token 层，需设计决策，非本计划范围）**：为 `@ui/tokens` 设计深色 Profile（深色纸感的语义落位：bg/surface/text 层级反转策略、scrim、阴影在深色下的表现），产出对应 CSS 与 `tokens.spec` 断言。这涉及视觉设计决策，须由维护者/有经验者先行，产出物评审合入。
- **T11-B（文档站接入，初级可做，前置条件 = T11-A 合入）**：`config.ts` 开启 `appearance: true`，为暗色态补 VitePress 变量覆写（`paper-theme.css` 中对 `--vp-*` 的覆写需两档各验证一遍），回归全部页面 + 代码块配色。

**T11-B 验收要点（届时执行）**：右上角出现外观切换；切换后文档站全站无「白底黑字残留块」；组件 demo 在深色下可读；焦点环在两档下均可见；`pnpm docs:build` 绿。

在此之前，**任何任务都不得改 `appearance: false`**。

---

## 3. 暂缓清单（明确不做，防止自行发挥）

| 事项 | 暂缓原因 |
|------|----------|
| 组件页数量补齐（24 个组件无文档页） | 内容生产另行排期；机制（写完自动挂侧边栏）已就绪 |
| 部署 / CI / SEO（sitemap、ogImage） | 用户明确排除；待站点定稿后做 |
| i18n / 英文站 | `srcDir: src/zh` 已预留结构，成本高、非当前优先级 |
| 搜索换 DocSearch（Algolia） | 站点公开上线后再申请；local + T2 已够本地开发用 |
| demo「新窗口打开」/ StackBlitz 集成 / props knobs | 依赖部署形态与组件数量，先观察 T1–T9 效果再定 |
| ApiTables 类型跳转、逐行 since 标注 | 需扩展 meta 契约（`shared/meta.ts` 只增不改字段语义），须走契约升级流程提案 |
| 可视「状态墙」（真实渲染 hover/focus/disabled 各态） | 需 meta 的 states 从字符串升级为可渲染结构，属契约升级提案 |
| 侧边栏折叠为「通用/输入/…」分组下的搜索框 | 现有组件数量少，收益有限 |

---

## 附录 A · 总回归清单（全部任务完成后跑一遍）

`pnpm docs:dev` 起服务，逐项确认：

- [ ] 首页：hero / features / HomeCollage 正常，页脚出现
- [ ] 导航栏：GitHub 图标；「指南 / 组件 / 设计 Token」跳转正常
- [ ] `/guide/installation`、`/guide/quickstart`、`/guide/theming`：目录正常、代码块复制按钮可用、「编辑此页」链接正确、最后更新时间显示
- [ ] `/components/general/button`：本页目录完整可点；`#api-props` / `#states` / `#icons` 直达；相关组件 Toast 可跳转；引入复制按钮；契约版本展示；「查看源码」展开高亮正常
- [ ] `/components/data/table`、`/components/feedback/toast`：同上抽查
- [ ] `/tokens/`：TokenBoard + 复制 + 实验器（改 accent 只影响预览区）
- [ ] 搜索：`loading`（→Button）、`accent`（→Token 页）、`表格`（→Table）均有结果
- [ ] `/no-such-page`：中文 404
- [ ] 375px 视口：无横向溢出（首页 + 组件页 + Token 页）
- [ ] `pnpm -C apps/docs typecheck` 与 `pnpm docs:build` 退出码 0

## 附录 B · 常见坑与自救

1. **dev 端口不是 5173**：终端会打印实际端口（5174 等），以终端为准。
2. **T2 验收搜不到**：确认改过 meta / paper.css 后**重启过 dev**（索引不热更）。
3. **`pnpm docs:build` 报 dead link**：说明链接指向了不存在的页面。检查 T3 的 `documentedDirs` 过滤是否生效、T5 的三个链接是否拼错。死链检查是安全网，不要用 `ignoreDeadLinks` 关掉它。
4. **typecheck 报 `_render` 相关类型错误**：按 T2 的写法——`search-extra.ts` 里用 `DefaultTheme.LocalSearchOptions & { _render: … }` 交叉类型，`config.ts` 直接赋值、不加断言。若仍报错说明 vitepress 的类型声明有变化，带报错原文上报，不要改成 `any`。
5. **升级 vitepress 后**：T2 的 `_render` 属内部钩子，升级后第一时间重跑 T2 验收清单；若钩子签名变了，带版本号上报，不要自行猜新 API。
6. **token 缺值**（如 `--ui-space-8` 不存在）：按 CONVENTIONS §9.3，在任务结果中提出 token 需求，用既有 token 替代实现，**严禁写裸值**。
7. **看到 `appearance: false` 想顺手开暗色**：不要。见 T11。
