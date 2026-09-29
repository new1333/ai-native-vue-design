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
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'
import { componentMetaFiles } from './sidebar'

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
 * 从组件目录全部 meta（主 + 子组件，如 button/ 的 Button 与 ButtonGroup）
 * 源码提取单引号字符串作为语料：覆盖 props/slots/events 的名称、类型、
 * 默认值、描述与 states/agent 提示。收录全部 meta 使语料不依赖「谁是主
 * meta」的解析结果，家族子组件（无独立文档页）也能在其家族页被搜到。
 * meta 是纯数据对象（仅 import type），此提取稳定；若未来 meta 引入
 * 运行时字符串拼接，需回归。
 */
function searchableTextFromMeta(dir: string): string {
  const values = new Set<string>()
  for (const metaPath of componentMetaFiles(dir)) {
    const source = readFileSync(metaPath, 'utf8')
    for (const match of source.matchAll(/'([^'\n]+)'/g)) values.add(match[1])
  }
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
