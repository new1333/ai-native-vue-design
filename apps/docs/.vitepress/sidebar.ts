/**
 * 侧边栏自动生成：扫描 packages/components/src/<dir>/<Pascal>.meta.ts，
 * 提取 identity.name / identity.category 生成分组导航；条目展示名优先取
 * 组件页 md frontmatter 的 title，缺失时回退 identity.name。
 *
 * - 组件页文件位于 src/zh/components/<category>/<dir>.md；尚无对应 md 的组件
 *   （文档未写）自动跳过，因此试点阶段只出现已交付页面，写完即自动挂上。
 * - meta 缺失/无法解析时直接抛错：门禁期失败优于静默漏挂。
 * - buildHomeDirectory() 与侧边栏同源，为首页「组件家族」目录供数。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import type { DefaultTheme } from 'vitepress'

const DOCS_ROOT = fileURLToPath(new URL('../', import.meta.url))
const COMPONENTS_SRC = resolve(DOCS_ROOT, '../../packages/components/src')
const PAGES_DIR = resolve(DOCS_ROOT, 'src/zh/components')

/** 分类固定顺序与中文标签（与设计文档的产品族划分对应；llms.ts 生成器共用）。 */
export const CATEGORY_ORDER: Array<{ key: string; label: string }> = [
  { key: 'general', label: '通用' },
  { key: 'inputs', label: '输入' },
  { key: 'data', label: '数据' },
  { key: 'feedback', label: '反馈' },
  { key: 'overlay', label: '浮层' },
  { key: 'typography', label: '排版' },
  { key: 'navigation', label: '导航' },
]

function pascalize(dir: string): string {
  return dir.replace(/(^|-)([a-z])/g, (_, __, char: string) => char.toUpperCase())
}

/** 主 meta 与目录名不一致的组件：显式登记，缺省按 <Pascal(dir)>.meta.ts 查找。 */
const PRIMARY_META: Record<string, string> = {
  toast: 'ToastHost.meta.ts',
  typography: 'Text.meta.ts',
}

/** 目录名 → 主 meta 文件绝对路径（侧边栏扫描与搜索语料提取共用） */
export function metaPathForDir(dir: string): string {
  const metaFile = PRIMARY_META[dir] ?? `${pascalize(dir)}.meta.ts`
  return join(COMPONENTS_SRC, dir, metaFile)
}

interface ComponentEntry {
  dir: string
  name: string
  category: string
  /** 侧边栏展示名：页面 frontmatter title 优先 */
  label: string
}

/** 从页面 md 的 frontmatter 读取 title（侧边栏展示名）；缺失时回退 meta 名 */
function pageTitle(pagePath: string, fallback: string): string {
  const match = readFileSync(pagePath, 'utf8').match(/^title:\s*(.+)$/m)
  return match ? match[1].trim() : fallback
}

/** 扫描结果为原始字段（无展示名）；label 由 buildSidebar 在确认页面存在后补齐 */
function scanComponents(): Array<Omit<ComponentEntry, 'label'>> {
  const entries: Array<Omit<ComponentEntry, 'label'>> = []
  for (const dir of readdirSync(COMPONENTS_SRC, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name === 'shared') continue
    const metaPath = metaPathForDir(dir.name)
    if (!existsSync(metaPath)) {
      throw new Error(`[docs sidebar] 缺少主组件 meta：${metaPath}`)
    }
    const source = readFileSync(metaPath, 'utf8')
    const identity = source.match(/identity:\s*\{[\s\S]*?name:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'/)
    if (!identity) {
      throw new Error(`[docs sidebar] 无法从 meta 解析 identity：${metaPath}`)
    }
    entries.push({ dir: dir.name, name: identity[1], category: identity[2] })
  }
  return entries
}

export function buildSidebar(): DefaultTheme.Sidebar {
  return {
    '/guide/': [
      {
        text: '指南',
        items: [
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/quickstart' },
          { text: '主题与 Token', link: '/guide/theming' },
        ],
      },
    ],
    '/components/': buildComponentGroups(),
    '/tokens/': [
      { text: '设计 Token', items: [{ text: 'Token 总览', link: '/tokens/' }] },
    ],
  }
}

/** 组件分组的精确形状（侧边栏与首页目录共用的同源构建）。 */
interface ComponentSidebarGroup {
  text: string
  items: Array<{ text: string; link: string }>
}

function buildComponentGroups(): ComponentSidebarGroup[] {
  const byCategory = new Map<string, ComponentEntry[]>()
  for (const entry of scanComponents()) {
    if (!CATEGORY_ORDER.some(({ key }) => key === entry.category)) {
      throw new Error(`[docs sidebar] 未知分类「${entry.category}」（${entry.dir}）：请在 sidebar.ts 的 CATEGORY_ORDER 中登记`)
    }
    const pagePath = join(PAGES_DIR, entry.category, `${entry.dir}.md`)
    if (!existsSync(pagePath)) continue
    const label = pageTitle(pagePath, entry.name)
    const list = byCategory.get(entry.category) ?? []
    list.push({ ...entry, label })
    byCategory.set(entry.category, list)
  }

  return CATEGORY_ORDER
    .filter(({ key }) => byCategory.has(key))
    .map(({ key, label }) => ({
      text: label,
      items: (byCategory.get(key) ?? []).map(({ dir, label, category }) => ({
        text: label,
        link: `/components/${category}/${dir}`,
      })),
    }))
}

/* ============================================================
 * 首页「组件家族」目录数据：与侧边栏同源（同一扫描、同一存在性
 * 过滤），经 config.ts 注入 themeConfig.homeDirectory 供首页
 * ComponentDirectory / AiWorkbench 消费，双侧永不漂移。
 * ============================================================ */

export interface HomeDirectoryItem {
  label: string
  link: string
}

export interface HomeDirectoryGroup {
  label: string
  items: HomeDirectoryItem[]
}

export interface HomeDirectoryData {
  groups: HomeDirectoryGroup[]
  /** 家族（分类）数 */
  families: number
  /** 已交付文档页的组件总数 */
  total: number
}

export function buildHomeDirectory(): HomeDirectoryData {
  const groups: HomeDirectoryGroup[] = buildComponentGroups().map((group) => ({
    label: group.text,
    items: group.items.map((item) => ({ label: item.text, link: item.link })),
  }))
  return {
    groups,
    families: groups.length,
    total: groups.reduce((sum, group) => sum + group.items.length, 0),
  }
}
