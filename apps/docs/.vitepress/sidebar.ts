/**
 * 侧边栏自动生成：扫描 packages/components/src/<dir>/<Pascal>.meta.ts，
 * 提取 identity.name / identity.category 生成分组导航。
 *
 * - 组件页文件位于 src/zh/components/<category>/<dir>.md；尚无对应 md 的组件
 *   （文档未写）自动跳过，因此试点阶段只出现已交付页面，写完即自动挂上。
 * - meta 缺失/无法解析时直接抛错：门禁期失败优于静默漏挂。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import type { DefaultTheme } from 'vitepress'

const DOCS_ROOT = fileURLToPath(new URL('../', import.meta.url))
const COMPONENTS_SRC = resolve(DOCS_ROOT, '../../packages/components/src')
const PAGES_DIR = resolve(DOCS_ROOT, 'src/zh/components')

/** 分类固定顺序与中文标签（与设计文档的产品族划分对应）。 */
const CATEGORY_ORDER: Array<{ key: string; label: string }> = [
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

interface ComponentEntry {
  dir: string
  name: string
  category: string
}

function scanComponents(): ComponentEntry[] {
  const entries: ComponentEntry[] = []
  for (const dir of readdirSync(COMPONENTS_SRC, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name === 'shared') continue
    const metaFile = PRIMARY_META[dir.name] ?? `${pascalize(dir.name)}.meta.ts`
    const metaPath = join(COMPONENTS_SRC, dir.name, metaFile)
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
  const byCategory = new Map<string, ComponentEntry[]>()
  for (const entry of scanComponents()) {
    if (!CATEGORY_ORDER.some(({ key }) => key === entry.category)) {
      throw new Error(`[docs sidebar] 未知分类「${entry.category}」（${entry.dir}）：请在 sidebar.ts 的 CATEGORY_ORDER 中登记`)
    }
    const pagePath = join(PAGES_DIR, entry.category, `${entry.dir}.md`)
    if (!existsSync(pagePath)) continue
    const list = byCategory.get(entry.category) ?? []
    list.push(entry)
    byCategory.set(entry.category, list)
  }

  const componentGroups = CATEGORY_ORDER
    .filter(({ key }) => byCategory.has(key))
    .map(({ key, label }) => ({
      text: label,
      items: (byCategory.get(key) ?? []).map(({ dir, name, category }) => ({
        text: name,
        link: `/components/${category}/${dir}`,
      })),
    }))

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
    '/components/': componentGroups,
    '/tokens/': [
      { text: '设计 Token', items: [{ text: 'Token 总览', link: '/tokens/' }] },
    ],
  }
}
