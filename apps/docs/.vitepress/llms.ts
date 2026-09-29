/**
 * llms.ts —— LLM 友好文档三件套生成（仅 Node 侧，只允许被 config.ts 引入）。
 *
 * 挂在 VitePress 官方 buildEnd 钩子上：站点构建完成后，把 registry/*.json
 * （meta 契约的机器可读形态，由 tooling/sync-registry.mjs 从各组件 Xxx.meta.ts
 * 再生、validate-registry.mjs 做双向校验）渲染为静态 Markdown 写入 outDir：
 *
 *   llms.txt                          llmstxt.org 约定的站点索引（链接指向下方 .md）
 *   llms-full.txt                     全量文档单文件（指南 + 全部组件契约 + token 表）
 *   components/<category>/<dir>.md    逐组件完整契约（每个 registry 记录一个）
 *   tokens.md                         全部 --ui-* token 完整清单
 *   guide/<name>.md                   指南页 Markdown 版（剥 frontmatter 与页面编排脚本）
 *
 * 手法与 sidebar.ts 同源：门禁期失败优于静默漏挂——registry 缺失、结构不符、
 * 与组件源码目录对不上（陈旧）时直接抛错，错误信息给出再生命令。
 * 链接一律绝对 URL，指向 GitHub Pages 部署域（与 config.ts 的 base、
 * .github/workflows/docs-pages.yml 的部署路径约定一致，勿单侧改动）。
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ComponentDefinition } from '@comp-src/shared/meta'
import { CATEGORY_ORDER, scanBlocks } from './sidebar'

const DOCS_ROOT = fileURLToPath(new URL('../', import.meta.url))
const REGISTRY_DIR = resolve(DOCS_ROOT, '../../registry')
const COMPONENTS_SRC = resolve(DOCS_ROOT, '../../packages/components/src')
const PAGES_DIR = resolve(DOCS_ROOT, 'src/zh/components')
const GUIDE_DIR = resolve(DOCS_ROOT, 'src/zh/guide')
const BLOCKS_SRC_DIR = resolve(DOCS_ROOT, 'src/blocks')

/** 站点部署域：GitHub Project Pages（勿单侧改动，见 config.ts base 注释）。 */
const SITE_ORIGIN = 'https://new1333.github.io'

const COMPONENTS_JSON = join(REGISTRY_DIR, 'components.json')
const TOKENS_JSON = join(REGISTRY_DIR, 'tokens.json')

// ── registry 数据形状（sync-registry / validate-registry 产物）────────

/** registry/components.json 单条记录 = meta 契约 + 来源信息 + 子组件。 */
interface RegistryRecord extends ComponentDefinition {
  source: { dir: string; metaFiles: string[] }
  subComponents: ComponentDefinition[]
}

interface ComponentsFile {
  schemaVersion: number
  count: number
  components: RegistryRecord[]
}

interface TokenItem {
  name: string
  variable: string
  value: string
  layer: string
}

interface TokensFile {
  schemaVersion: number
  package: string
  profile: string
  source: string
  count: number
  tokens: TokenItem[]
  notes: string[]
}

/** buildEnd 回调入参中本模块消费的最小结构（结构化声明，避免依赖内部类型导出面）。 */
interface LlmsSiteConfig {
  outDir: string
  site: { base: string }
}

// ── 加载与门禁 ────────────────────────────────────────────────

function readComponentsRegistry(): ComponentsFile {
  if (!existsSync(COMPONENTS_JSON)) {
    throw new Error(`[llms] 找不到 ${COMPONENTS_JSON}：请先运行 node tooling/sync-registry.mjs`)
  }
  const data = JSON.parse(readFileSync(COMPONENTS_JSON, 'utf8')) as ComponentsFile
  if (data.schemaVersion !== 1) {
    throw new Error(`[llms] components.json schemaVersion 应为 1，实际 ${String(data.schemaVersion)}`)
  }
  if (!Array.isArray(data.components) || data.components.length === 0) {
    throw new Error('[llms] components.json components 应为非空数组')
  }
  for (const record of data.components) {
    const where = `[llms] components.json:${record.id ?? '<无 id>'}`
    if (typeof record.version !== 'string' || record.version.length === 0) {
      throw new Error(`${where} 缺少 version`)
    }
    if (typeof record.identity?.name !== 'string' || typeof record.identity?.category !== 'string') {
      throw new Error(`${where} identity.name / identity.category 缺失`)
    }
    if (typeof record.identity.export !== 'string' || typeof record.identity.package !== 'string') {
      throw new Error(`${where} identity.export / identity.package 缺失`)
    }
    if (typeof record.source?.dir !== 'string' || !Array.isArray(record.subComponents)) {
      throw new Error(`${where} source.dir / subComponents 缺失（registry 记录应为主记录形态）`)
    }
    // 深层形状（intent/api/states/agent 等）由 meta 契约对账测试与
    // validate-registry.mjs 保障，此处不重复校验。
  }
  assertFreshRegistry(data)
  return data
}

/** 防陈旧守卫：registry 记录的目录集合必须与组件源码目录集合完全一致。 */
function assertFreshRegistry(data: ComponentsFile): void {
  const diskDirs = new Set(
    readdirSync(COMPONENTS_SRC, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => readdirSync(join(COMPONENTS_SRC, entry.name)).some((f) => f.endsWith('.meta.ts')))
      .map((entry) => entry.name),
  )
  const registryDirs = new Set(data.components.map((record) => record.source.dir))
  for (const dir of registryDirs) {
    if (!diskDirs.has(dir)) {
      throw new Error(`[llms] registry 多出组件目录「${dir}」：请先运行 node tooling/sync-registry.mjs`)
    }
  }
  for (const dir of diskDirs) {
    if (!registryDirs.has(dir)) {
      throw new Error(`[llms] registry 缺少组件目录「${dir}」：请先运行 node tooling/sync-registry.mjs`)
    }
  }
}

function readTokensRegistry(): TokensFile {
  if (!existsSync(TOKENS_JSON)) {
    throw new Error(`[llms] 找不到 ${TOKENS_JSON}：请检查 registry 生成链路（sync-registry 同批产物）`)
  }
  const data = JSON.parse(readFileSync(TOKENS_JSON, 'utf8')) as TokensFile
  if (data.schemaVersion !== 1) {
    throw new Error(`[llms] tokens.json schemaVersion 应为 1，实际 ${String(data.schemaVersion)}`)
  }
  if (!Array.isArray(data.tokens) || data.tokens.length === 0) {
    throw new Error('[llms] tokens.json tokens 应为非空数组')
  }
  if (!Array.isArray(data.notes)) {
    throw new Error('[llms] tokens.json notes 应为数组')
  }
  for (const token of data.tokens) {
    if (typeof token.variable !== 'string' || typeof token.value !== 'string' || typeof token.layer !== 'string') {
      throw new Error(`[llms] tokens.json 记录缺少 variable/value/layer：${JSON.stringify(token)}`)
    }
  }
  return data
}

// ── Markdown 基础件 ───────────────────────────────────────────

/** 行内文本净化：换行会破坏表格行与列表项，折叠为空格。 */
function inline(text: string): string {
  return text.replace(/\r?\n/g, ' ').trim()
}

/** 表格单元格净化：竖线会终结单元格（类型字符串普遍含联合类型竖线）。 */
function cell(text: string): string {
  return inline(text).replace(/\|/g, '\\|')
}

function mdTable(headers: readonly string[], rows: ReadonlyArray<readonly string[]>): string {
  const head = `| ${headers.join(' | ')} |`
  const rule = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map((row) => `| ${row.map(cell).join(' | ')} |`)
  return [head, rule, ...body].join('\n')
}

function bullets(items: readonly string[]): string {
  return items.map((item) => `- ${inline(item)}`).join('\n')
}

/** 以空行分隔拼接非空块；false 表示条件性跳过的块。 */
function joinBlocks(blocks: ReadonlyArray<string | false>): string {
  return blocks.filter((block): block is string => typeof block === 'string' && block.length > 0).join('\n\n')
}

/** 名称清单 → 行内代码串：`a`、`b`。 */
function nameList(names: readonly string[]): string {
  return names.map((name) => `\`${inline(name)}\``).join('、')
}

/** 有内容才输出「**标签**：内容」行。 */
function labeledList(label: string, items: readonly string[]): string {
  return items.length > 0 ? `**${label}**：${nameList(items)}` : ''
}

/** 有内容才输出「**标签** + 列表」块。 */
function labeledBullets(label: string, items: readonly string[]): string {
  return items.length > 0 ? `**${label}**\n\n${bullets(items)}` : ''
}

// ── 组件契约渲染 ──────────────────────────────────────────────

interface ComponentDocOptions {
  /** 组件文档页（HTML）绝对 URL；子组件无独立页面，不输出。 */
  pageUrl?: string
  /** 标题层级：主组件 1、子组件 2。 */
  heading?: 1 | 2
}

function renderComponentDoc(def: ComponentDefinition, options: ComponentDocOptions = {}): string {
  const pound = '#'.repeat(options.heading ?? 1)
  const { identity, intent, api } = def

  const apiSection = (label: string, headers: readonly string[], rows: ReadonlyArray<readonly string[]>): string =>
    rows.length === 0 ? '' : `### ${label}\n\n${mdTable(headers, rows)}`

  const apiBlock = joinBlocks([
    apiSection('Props', ['名称', '类型', '默认值', '必填', '说明'],
      api.props.map((p) => [p.name, p.type, p.default ?? '—', p.required === true ? '是' : '否', p.description])),
    apiSection('插槽（slots）', ['名称', '作用域', '说明'],
      api.slots.map((s) => [s.name, s.scope ?? '—', s.description])),
    apiSection('事件（events）', ['名称', '载荷', '说明'],
      api.events.map((e) => [e.name, e.payload ?? '—', e.description])),
    apiSection('Expose', ['名称', '类型', '说明'],
      api.exposes.map((x) => [x.name, x.type, x.description])),
  ])

  const stateRows: Array<[string, string]> = [
    ['default', def.states.default],
    ['hover', def.states.hover],
    ['focusVisible', def.states.focusVisible],
    ['active', def.states.active],
    ['disabled', def.states.disabled],
  ]
  if (def.states.loading !== undefined) stateRows.push(['loading', def.states.loading])
  if (def.states.error !== undefined) stateRows.push(['error', def.states.error])

  const { constraints, composition } = def
  const constraintLines = [
    labeledList('前置（requires）', constraints.requires ?? []),
    labeledList('冲突（conflicts）', constraints.conflicts ?? []),
    labeledList('依赖（dependsOn）', constraints.dependsOn ?? []),
  ].filter((line) => line.length > 0)

  return joinBlocks([
    `${pound} ${identity.name}`,
    `> ${identity.description}`,
    [
      `- 导出：\`${identity.export}\`（\`${identity.package}\`）· 契约 id：\`${def.id}\` · 契约版本：${def.version}`,
      options.pageUrl !== undefined && `- 在线文档：${options.pageUrl}`,
    ].filter((line): line is string => line !== false).join('\n'),
    `## 引入\n\n\`\`\`\nimport { ${identity.export} } from '${identity.package}'\n\`\`\``,
    `## 何时使用\n\n${intent.what}\n\n${joinBlocks([
      labeledBullets('适用', intent.when),
      labeledBullets('不适用', intent.whenNot),
      intent.userTask.length > 0 && `**用户任务**：${intent.userTask}`,
    ])}`,
    `## API\n\n${apiBlock}`,
    `## 交互状态\n\n${mdTable(['状态', '行为与视觉'], stateRows)}`,
    constraintLines.length > 0 && `## 约束\n\n${constraintLines.join('\n')}`,
    joinBlocks([
      '## 组合',
      labeledBullets('常见模式', composition.patterns),
      labeledList('相关组件', composition.related),
      labeledList('推荐组合', composition.preferred),
    ]),
    `## 无障碍\n\n${def.accessibility}`,
    `## SSR\n\n${def.ssr}`,
    `## 性能\n\n${def.performance}`,
    `## 样式\n\n${def.styling}`,
    `## 示例\n\n${def.examples.map((example) => `\`\`\`vue\n${example.trim()}\n\`\`\``).join('\n\n')}`,
    joinBlocks([
      '## Agent 提示',
      labeledList('关键词', def.agent.keywords),
      labeledBullets('选型提示', def.agent.selectionHints),
      labeledBullets('常见任务', def.agent.commonTasks),
      labeledBullets('生成注意', def.agent.generationNotes),
    ]),
  ])
}

/** registry 主记录渲染：主契约 + 子组件（子组件无独立页面，降一级标题）。 */
function renderRecordDoc(record: RegistryRecord, pageUrl?: string): string {
  const subs = record.subComponents.map((sub) => renderComponentDoc(sub, { heading: 2 }))
  return joinBlocks([renderComponentDoc(record, { pageUrl }), ...subs])
}

// ── token / 指南渲染 ──────────────────────────────────────────

const TOKEN_LAYERS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'primitive', label: 'primitive（原始值）' },
  { key: 'semantic', label: 'semantic（语义层）' },
  { key: 'component', label: 'component（组件别名）' },
]

function renderTokensDoc(tokensFile: TokensFile, overviewUrl: string): string {
  const sections = TOKEN_LAYERS.map(({ key, label }) => {
    const rows = tokensFile.tokens
      .filter((token) => token.layer === key)
      .map((token) => [token.name, token.variable, token.value])
    return rows.length > 0 ? `## ${label}\n\n${mdTable(['名称', '变量', '值'], rows)}` : ''
  })
  return joinBlocks([
    '# 设计 Token（--ui-*）',
    `> ${tokensFile.count} 个 token · Profile：${tokensFile.profile} · 数据源 \`${tokensFile.source}\`（与 paper.css :root 双向校验一致）。`,
    `- 在线总览：${overviewUrl}`,
    ...sections,
    `## 说明\n\n${bullets(tokensFile.notes)}`,
  ])
}

/** 指南页清单：title 用于 llms.txt 链接行，summary 为一句话描述（指南为 prose 页，非 meta 契约内容）。 */
const GUIDE_PAGES: ReadonlyArray<{ name: string; title: string; summary: string }> = [
  { name: 'installation', title: '安装', summary: '包引入方式、peer 依赖（Vue ^3.5）与 workspace 结构' },
  { name: 'quickstart', title: '快速开始', summary: '三步接入：应用入口引 token、组件按需引入、挂载命令式服务 Host' },
  { name: 'theming', title: '主题与 Token', summary: 'Paper Profile 与 --ui-* token 三层结构的消费与覆盖' },
]

/** 指南页 md → 纯 markdown：剥 frontmatter 与 <script setup> 页面编排块（demo 引入对 LLM 无意义）。 */
function guideMarkdown(name: string): string {
  const source = readFileSync(join(GUIDE_DIR, `${name}.md`), 'utf8')
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, '')
    .replace(/<script setup>[\s\S]*?<\/script>\s*/g, '')
    .trimStart()
}

// ── 页面构建块渲染 ────────────────────────────────────────────

interface BlockDoc {
  /** 页面 stem（块的 kebab 名），如 login */
  name: string
  /** 页面 frontmatter title */
  title: string
  /** 页面 frontmatter description（一句话简介） */
  description: string
  /** 源码文件名，如 LoginBlock.vue */
  file: string
  /** 完整 SFC 源码 */
  source: string
}

/** kebab 名 → 源码文件名：login → LoginBlock.vue、ai-workspace → AiWorkspaceBlock.vue */
function blockSourceFile(name: string): string {
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return `${pascal}Block.vue`
}

/**
 * 读取全部构建块（扫描与 sidebar 同源）。源码文件缺失时抛错：
 * 页面存在但 SFC 缺失即「文档说有、复制拿不到」，门禁期失败优于静默漏挂。
 */
function readBlocks(): BlockDoc[] {
  return scanBlocks().map((block) => {
    const file = blockSourceFile(block.name)
    const path = join(BLOCKS_SRC_DIR, file)
    if (!existsSync(path)) {
      throw new Error(`[llms] 构建块「${block.name}」缺少源码文件：${path}（约定为 <Pascal>Block.vue 单文件 SFC）`)
    }
    return {
      name: block.name,
      title: block.label,
      description: block.description,
      file,
      source: readFileSync(path, 'utf8'),
    }
  })
}

function renderBlockDoc(block: BlockDoc, pageUrl: string): string {
  return joinBlocks([
    `# ${block.title}（页面构建块）`,
    block.description && `> ${block.description}`,
    [
      `- 在线文档：${pageUrl}`,
      '- 依赖：`@ui/components` + `@ui/tokens/paper.css`（应用入口引入一次）',
      '- 单文件自包含 SFC，复制到项目即可作为页面起点；交互为演示实现，替换为真实接口',
    ].join('\n'),
    `## 源码（${block.file}）\n\n\`\`\`vue\n${block.source.trim()}\n\`\`\``,
  ])
}

// ── llms.txt / llms-full.txt ──────────────────────────────────

/** 页面 frontmatter title（侧边栏同款回退规则：缺失时用 meta 名）。 */
function pageLabel(category: string, dir: string, fallback: string): string {
  const pagePath = join(PAGES_DIR, category, `${dir}.md`)
  if (!existsSync(pagePath)) return fallback
  const match = readFileSync(pagePath, 'utf8').match(/^title:\s*(.+)$/m)
  return match ? match[1].trim() : fallback
}

/** 组件记录按 CATEGORY_ORDER 分组；出现未登记分类直接抛错（与 sidebar 同哲学）。 */
function groupByCategory(records: ReadonlyArray<RegistryRecord>): Array<{ key: string; label: string; items: RegistryRecord[] }> {
  const known = new Set(CATEGORY_ORDER.map(({ key }) => key))
  for (const record of records) {
    if (!known.has(record.identity.category)) {
      throw new Error(`[llms] 未知分类「${record.identity.category}」（${record.source.dir}）：请在 sidebar.ts 的 CATEGORY_ORDER 中登记`)
    }
  }
  return CATEGORY_ORDER.map(({ key, label }) => ({
    key,
    label,
    items: records.filter((record) => record.identity.category === key),
  })).filter((group) => group.items.length > 0)
}

function siteUrl(base: string, path: string): string {
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`
  return `${SITE_ORIGIN}${baseWithSlash}${path}`
}

function renderLlmsIndex(
  componentsFile: ComponentsFile,
  tokensFile: TokensFile,
  blocks: BlockDoc[],
  mdUrl: (path: string) => string,
): string {
  const groups = groupByCategory(componentsFile.components)
  const subTotal = componentsFile.components.reduce((n, c) => n + c.subComponents.length, 0)
  return joinBlocks([
    '# 纸面 Paper —— AI-native Vue 3 组件库',
    `> ${componentsFile.count} 个 Vue 3 组件（另含 ${subTotal} 个子组件契约）${blocks.length > 0 ? `与 ${blocks.length} 个页面构建块` : ''}，全部以结构化 meta（机器可读契约）驱动：token-only 视觉（--ui-*）、a11y / SSR 就绪。每个链接指向该组件完整契约的 Markdown 版（API / 状态 / 无障碍 / Agent 选型与生成提示）。`,
    `本文件由 VitePress 构建钩子自动生成，请勿手改。registry 与组件实现的一致性由 meta 契约对账测试与 validate-registry 双向校验保障；原始 JSON 数据见仓库 registry/ 目录（components.json / tokens.json）。Profile 主题共 ${tokensFile.count} 个 --ui-* token。`,
    `## 指南\n\n${GUIDE_PAGES.map((page) => `- [${page.title}](${mdUrl(`guide/${page.name}.md`)}): ${page.summary}`).join('\n')}`,
    `## 设计 Token\n\n- [Token 总览](${mdUrl('tokens.md')}): ${tokensFile.count} 个 --ui-* token（primitive / semantic / component 三层）完整清单与用法`,
    ...groups.map((group) =>
      `## 组件 · ${group.label}（${group.key}）\n\n${group.items.map((record) => {
        const path = `components/${record.identity.category}/${record.source.dir}.md`
        const labelText = pageLabel(record.identity.category, record.source.dir, record.identity.name)
        return `- [${labelText}](${mdUrl(path)}): ${record.identity.description}`
      }).join('\n')}`,
    ),
    blocks.length > 0 &&
      `## 页面构建块\n\n${blocks.map((block) => `- [${block.title}](${mdUrl(`blocks/${block.name}.md`)}): ${block.description}`).join('\n')}`,
  ])
}

function renderLlmsFull(
  componentsFile: ComponentsFile,
  tokensFile: TokensFile,
  blocks: BlockDoc[],
  base: string,
): string {
  const groups = groupByCategory(componentsFile.components)
  const subTotal = componentsFile.components.reduce((n, c) => n + c.subComponents.length, 0)
  return joinBlocks([
    '# 纸面 Paper —— 组件库完整文档（llms-full）',
    `> 本文件为全量单文件版：内容等于 llms.txt 所列全部 .md 之和（指南 + ${componentsFile.count} 个组件契约 + ${tokensFile.count} 个 token${blocks.length > 0 ? ` + ${blocks.length} 个页面构建块` : ''}）。由 VitePress 构建钩子自动生成，请勿手改。`,
    `- 组件：${componentsFile.count} 个主组件 / ${subTotal} 个子组件 · token：${tokensFile.count} 个 · 分类：${groups.map((group) => group.key).join(' / ')}${blocks.length > 0 ? ` · 构建块：${blocks.length} 个` : ''}`,
    `- 原始 JSON（机器可读 registry）：仓库 registry/ 目录（components.json / tokens.json）`,
    '## 指南',
    ...GUIDE_PAGES.map((page) => guideMarkdown(page.name)),
    ...groups.flatMap((group) =>
      group.items.map((record) =>
        renderRecordDoc(record, siteUrl(base, `components/${record.identity.category}/${record.source.dir}.html`)),
      ),
    ),
    ...blocks.map((block) => renderBlockDoc(block, siteUrl(base, `blocks/${block.name}.html`))),
    renderTokensDoc(tokensFile, siteUrl(base, 'tokens/')),
  ])
}

// ── buildEnd 入口 ─────────────────────────────────────────────

function writeFile(outDir: string, relPath: string, content: string): void {
  const file = join(outDir, relPath)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${content.trimEnd()}\n`, 'utf8')
}

/**
 * VitePress buildEnd 钩子：站点构建完成后向 outDir 写入 llms 三件套。
 * dev 模式不触发；CI（docs-pages.yml 的 pnpm docs:build）自动生效。
 */
export async function emitLlmsArtifacts(siteConfig: LlmsSiteConfig): Promise<void> {
  const componentsFile = readComponentsRegistry()
  const tokensFile = readTokensRegistry()
  const blocks = readBlocks()
  const { outDir } = siteConfig
  const base = siteConfig.site.base
  const mdUrl = (path: string): string => siteUrl(base, path)

  writeFile(outDir, 'llms.txt', renderLlmsIndex(componentsFile, tokensFile, blocks, mdUrl))
  const fullTxt = renderLlmsFull(componentsFile, tokensFile, blocks, base)
  writeFile(outDir, 'llms-full.txt', fullTxt)
  writeFile(outDir, 'tokens.md', renderTokensDoc(tokensFile, siteUrl(base, 'tokens/')))

  let fileTotal = 3
  for (const record of componentsFile.components) {
    writeFile(
      outDir,
      `components/${record.identity.category}/${record.source.dir}.md`,
      renderRecordDoc(record, siteUrl(base, `components/${record.identity.category}/${record.source.dir}.html`)),
    )
    fileTotal += 1
  }
  for (const page of GUIDE_PAGES) {
    writeFile(outDir, `guide/${page.name}.md`, guideMarkdown(page.name))
    fileTotal += 1
  }
  for (const block of blocks) {
    writeFile(
      outDir,
      `blocks/${block.name}.md`,
      renderBlockDoc(block, siteUrl(base, `blocks/${block.name}.html`)),
    )
    fileTotal += 1
  }

  console.log(
    `[llms] 已生成 llms.txt / llms-full.txt + ${componentsFile.components.length} 个组件 .md + tokens.md + 指南 ${GUIDE_PAGES.length} 页 + 构建块 ${blocks.length} 个（共 ${fileTotal} 个文件，llms-full ${fullTxt.length} 字符）→ ${outDir}`,
  )
}
