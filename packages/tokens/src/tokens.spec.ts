// @ui/tokens —— token 契约测试（node 环境即可运行，无浏览器 API）。
// 注：vitest 会把 CSS 导入 stub 成空串（含 ?raw），故用 node:fs 读取 paper.css 原文。
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { allTokens, collectTokens, component, paperCssVars, primitive, semantic } from './index'
import type { Token } from './index'

const paperCss = readFileSync(new URL('./paper.css', import.meta.url), 'utf8')

/** 提取某个选择器块内的声明（块内无嵌套花括号，纯声明块）。 */
function declarationsOf(block: string | undefined): Map<string, string> {
  const map = new Map<string, string>()
  if (!block) return map
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(block))) map.set(m[1], m[2].trim())
  return map
}

const rootBlock = paperCss.match(/:root\s*\{([\s\S]*?)\}/)?.[1]
const themeBlock = paperCss.match(/:root\[data-theme='paper'\]\s*\{([\s\S]*?)\}/)?.[1]
const rootDecls = declarationsOf(rootBlock)
const themeDecls = declarationsOf(themeBlock)

const semanticTokens: readonly Token[] = collectTokens(semantic)
// 表单控件描边语义对的 TS 定义（semantic.ts）不在本次修复的文件域内，暂未纳入
// semantic 对象；先以手工清单并入「语义 token 全集」，保证下面三处
// 「重声明全部语义 token」用例覆盖它们。待 semantic.ts 扩展后可收敛回 collectTokens(semantic)。
const semanticNames: readonly string[] = [
  ...semanticTokens.map((t) => t.name),
  '--ui-border-control',
  '--ui-border-control-strong',
]
const allNames: readonly string[] = allTokens.map((t) => t.name)

describe('@ui/tokens · 语义 token ↔ CSS 变量', () => {
  it('每个语义 token 都以 --ui- 命名并在 paper.css :root 中有对应 CSS 变量', () => {
    expect(semanticTokens.length).toBe(22)
    const missing = semanticNames.filter((name) => !name.startsWith('--ui-') || !rootDecls.has(name))
    expect(missing).toEqual([])
  })

  it(':root[data-theme=paper] 显式 Profile 块重新声明全部语义 token', () => {
    const missing = semanticNames.filter((name) => !themeDecls.has(name))
    expect(missing).toEqual([])
  })

  it('组件级最小集（button/input）也在两个块中声明', () => {
    for (const t of collectTokens(component)) {
      expect(rootDecls.has(t.name)).toBe(true)
      expect(themeDecls.has(t.name)).toBe(true)
    }
  })
})

describe('@ui/tokens · 命名唯一', () => {
  it('三层所有 token 的 CSS 变量名无重复', () => {
    expect(new Set(allNames).size).toBe(allNames.length)
  })

  it('paper.css :root 块内声明无重复', () => {
    const names = [...rootDecls.keys()]
    expect(new Set(names).size).toBe(names.length)
  })

  it('paper.css data-theme=paper 块内声明无重复', () => {
    const names = [...themeDecls.keys()]
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('@ui/tokens · paper.css 与 TS 对象同步', () => {
  it('每个 token 的声明值与 TS 对象 value 完全一致（两个块）', () => {
    const drift = allTokens.filter(
      (t) => rootDecls.get(t.name) !== t.value || themeDecls.get(t.name) !== t.value,
    )
    expect(drift.map((t) => `${t.name}: css=${rootDecls.get(t.name) ?? '<缺失>'} ts=${t.value}`)).toEqual([])
  })

  it('semantic / component 层的值均为 var() 引用，且引用目标存在', () => {
    const refMissing: string[] = []
    for (const t of [...collectTokens(semantic), ...collectTokens(component)]) {
      const ref = t.value.match(/^var\((--[\w-]+)\)$/)
      if (!ref || !allNames.includes(ref[1])) refMissing.push(`${t.name} -> ${t.value}`)
    }
    expect(refMissing).toEqual([])
  })

  it('paperCssVars 扁平映射与 token 一致', () => {
    expect(Object.keys(paperCssVars).length).toBe(allTokens.length)
    expect(paperCssVars['--ui-accent']).toBe('var(--ui-color-pine-600)')
    expect(paperCssVars['--ui-scrim']).toBe('var(--ui-color-scrim)')
  })
})

describe('@ui/tokens · 档位钉子（设计文档 §6.2 规定值）', () => {
  it('间距：4/8/12/16/24/32/48/64 对应 --ui-space-1..8', () => {
    expect(Object.values(primitive.space).map((t) => t.value)).toEqual([
      '4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px',
    ])
    expect(Object.values(primitive.space).map((t) => t.name)).toEqual([
      '--ui-space-1', '--ui-space-2', '--ui-space-3', '--ui-space-4',
      '--ui-space-5', '--ui-space-6', '--ui-space-7', '--ui-space-8',
    ])
  })

  it('圆角：xs=2（进度条端头）/ sm=6 / md=12 / lg=16', () => {
    expect(primitive.radius.xs.value).toBe('2px')
    expect(primitive.radius.sm.value).toBe('6px')
    expect(primitive.radius.md.value).toBe('12px')
    expect(primitive.radius.lg.value).toBe('16px')
  })

  it('字阶：12/13/15/17/20/24/30 对应 --ui-text-xs..3xl；行高 1.5/1.7/1.3；字重 400/500/600', () => {
    expect(Object.values(primitive.font.size).map((t) => t.value)).toEqual([
      '12px', '13px', '15px', '17px', '20px', '24px', '30px',
    ])
    expect(Object.values(primitive.font.size).map((t) => t.name)).toEqual([
      '--ui-text-xs', '--ui-text-sm', '--ui-text-md', '--ui-text-lg',
      '--ui-text-xl', '--ui-text-2xl', '--ui-text-3xl',
    ])
    expect(primitive.font.lineHeight.small.value).toBe('1.5')
    expect(primitive.font.lineHeight.body.value).toBe('1.7')
    expect(primitive.font.lineHeight.heading.value).toBe('1.3')
    expect(primitive.font.weight.regular.value).toBe('400')
    expect(primitive.font.weight.medium.value).toBe('500')
    expect(primitive.font.weight.semibold.value).toBe('600')
    expect(primitive.font.numeric.name).toBe('--ui-numeric')
    expect(primitive.font.numeric.value).toBe('tabular-nums')
  })

  it('动效：fast=150ms / default=180ms / ease-out；阴影四档；z-index 阶梯', () => {
    expect(primitive.motion.fast.value).toBe('150ms')
    expect(primitive.motion.default.value).toBe('180ms')
    expect(primitive.motion.easeOut.name).toBe('--ui-ease-out')
    expect(Object.values(primitive.shadow).map((t) => t.value)).toEqual([
      '0 1px 2px rgba(28,27,23,.05)',
      '0 1px 3px rgba(28,27,23,.06)',
      '0 4px 12px rgba(28,27,23,.08)',
      '0 8px 24px rgba(28,27,23,.12)',
    ])
    expect(Object.values(primitive.zIndex).map((t) => t.value)).toEqual([
      '10', '100', '200', '300', '400', '500',
    ])
    expect(Object.values(primitive.zIndex).map((t) => t.name)).toEqual([
      '--ui-z-sticky', '--ui-z-dropdown', '--ui-z-drawer',
      '--ui-z-modal', '--ui-z-toast', '--ui-z-tooltip',
    ])
  })

  it('语义色彩：bg/surface/text/accent/state/overlay 全集在 :root 中取 Paper 规定引用', () => {
    expect(semantic.bg.name).toBe('--ui-bg')
    expect(paperCssVars['--ui-bg']).toBe('var(--ui-color-paper)')
    expect(paperCssVars['--ui-surface']).toBe('var(--ui-color-paper-raised)')
    expect(paperCssVars['--ui-surface-muted']).toBe('var(--ui-color-sand)')
    expect(paperCssVars['--ui-text-1']).toBe('var(--ui-color-ink-900)')
    expect(paperCssVars['--ui-tooltip']).toBe('var(--ui-color-ink-950)')
    expect(paperCssVars['--ui-danger']).toBe('var(--ui-color-clay-600)')
  })
})

describe('@ui/tokens · paper.css 全局约定', () => {
  it('两档 color-scheme：浅档 light / 深档 dark（原生控件 / UA 弹层 / 文本选区高亮随档翻转）', () => {
    expect(rootBlock).toContain('color-scheme: light')
    expect(themeBlock).toContain('color-scheme: light')
    const dark = paperCss.match(/:root\.dark,\s*:root\[data-theme='paper-dark'\]\s*\{([\s\S]*?)\}/)?.[1] ?? ''
    expect(dark).toContain('color-scheme: dark')
  })

  it(':focus-visible 使用 2px solid var(--ui-accent) 与 2px offset', () => {
    const focusBlock = paperCss.match(/:focus-visible\s*\{[^}]*\}/)?.[0] ?? ''
    expect(focusBlock).toContain('outline: 2px solid var(--ui-accent)')
    expect(focusBlock).toContain('outline-offset: 2px')
  })

  it('prefers-reduced-motion: reduce 时动效 token 归零', () => {
    const i = paperCss.indexOf('@media (prefers-reduced-motion: reduce)')
    expect(i).toBeGreaterThanOrEqual(0)
    const tail = paperCss.slice(i)
    expect(tail).toContain('--ui-motion-fast: 0ms')
    expect(tail).toContain('--ui-motion-default: 0ms')
  })

  it('页面滚动约定：html/body 铺满视口、margin 0、overflow hidden、overscroll-behavior none', () => {
    const block = paperCss.match(/html,\s*body\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(block).toContain('height: 100%')
    expect(block).toContain('margin: 0')
    expect(block).toContain('overflow: hidden')
    expect(block).toContain('overscroll-behavior: none')
  })

  it('全局滚动条与 ScrollArea 装饰条同款：thumb/hover/宽高/圆角全走 token', () => {
    const universal = paperCss.match(/(^|\n)\*\s*\{([^}]*)\}/)?.[2] ?? ''
    expect(universal).toContain('scrollbar-width: thin')
    expect(universal).toContain('scrollbar-color: var(--ui-border-strong) transparent')

    const bar = paperCss.match(/\n::-webkit-scrollbar \{([^}]*)\}/)?.[1] ?? ''
    expect(bar).toContain('width: var(--ui-space-2)')
    expect(bar).toContain('height: var(--ui-space-2)')

    const thumb = paperCss.match(/\n::-webkit-scrollbar-thumb \{([^}]*)\}/)?.[1] ?? ''
    expect(thumb).toContain('background-color: var(--ui-border-strong)')
    expect(thumb).toContain('border-radius: var(--ui-radius-xs)')

    const thumbHover = paperCss.match(/\n::-webkit-scrollbar-thumb:hover \{([^}]*)\}/)?.[1] ?? ''
    expect(thumbHover).toContain('background-color: var(--ui-text-3)')
  })
})

describe('@ui/tokens · 深色 Profile（夜纸）', () => {
  const darkBlock = paperCss.match(
    /:root\.dark,\s*:root\[data-theme='paper-dark'\]\s*\{([\s\S]*?)\}/,
  )?.[1]
  const darkDecls = declarationsOf(darkBlock)

  it('双入口选择器存在，且声明顺序在显式 paper 档之后（组合态深色胜出）', () => {
    expect(darkBlock).toBeTruthy()
    expect(paperCss.indexOf(":root[data-theme='paper']")).toBeLessThan(paperCss.indexOf(':root.dark,'))
  })

  it('重声明全部语义 token 与 component 别名（Profile 档独立成立）', () => {
    const missing = [...semanticNames, ...collectTokens(component).map((t) => t.name)].filter(
      (name) => !darkDecls.has(name),
    )
    expect(missing).toEqual([])
  })

  it('不随档变的 primitive 亦全量重声明（不依赖默认档铺底）', () => {
    for (const name of [
      '--ui-space-8', '--ui-radius-lg', '--ui-font-sans', '--ui-text-3xl',
      '--ui-motion-default', '--ui-ease-out', '--ui-z-tooltip',
    ]) {
      expect(darkDecls.has(name)).toBe(true)
    }
  })

  it('块内声明无重复', () => {
    const names = [...darkDecls.keys()]
    expect(new Set(names).size).toBe(names.length)
  })

  it('语义落位：夜纸三级底 + 雾纸文字 + 同构 var() 引用链', () => {
    expect(darkDecls.get('--ui-bg')).toBe('var(--ui-color-night)')
    expect(darkDecls.get('--ui-surface')).toBe('var(--ui-color-night-raised)')
    expect(darkDecls.get('--ui-surface-muted')).toBe('var(--ui-color-dusk)')
    expect(darkDecls.get('--ui-text-1')).toBe('var(--ui-color-mist-100)')
    expect(darkDecls.get('--ui-text-2')).toBe('var(--ui-color-mist-300)')
    expect(darkDecls.get('--ui-text-3')).toBe('var(--ui-color-ink-300)')
    expect(darkDecls.get('--ui-accent')).toBe('var(--ui-color-pine-600)')
    expect(darkDecls.get('--ui-on-accent')).toBe('var(--ui-color-white)')
  })

  it('深色新槽位与重落位值（夜纸三级 / 雾纸 / 提亮弱墨 / 前景反转 / 提亮松绿 / 深阴影）', () => {
    expect(darkDecls.get('--ui-color-night')).toBe('#1B1A16')
    expect(darkDecls.get('--ui-color-night-raised')).toBe('#23221D')
    expect(darkDecls.get('--ui-color-dusk')).toBe('#2A2924')
    expect(darkDecls.get('--ui-color-mist-100')).toBe('#EDEAE0')
    expect(darkDecls.get('--ui-color-mist-300')).toBe('#B3AFA3')
    expect(darkDecls.get('--ui-color-ink-300')).toBe('#948F82')
    expect(darkDecls.get('--ui-color-white')).toBe('#22211C')
    expect(darkDecls.get('--ui-color-pine-600')).toBe('#7FAE97')
    expect(darkDecls.get('--ui-shadow-modal')).toBe('0 8px 24px rgba(0, 0, 0, 0.6)')
  })

  it('tooltip 对仗：浅色档墨片 ink-950 ↔ 深色档纸片 paper（墨上纸 ↔ 纸上墨）', () => {
    expect(rootDecls.get('--ui-tooltip')).toBe('var(--ui-color-ink-950)')
    expect(darkDecls.get('--ui-tooltip')).toBe('var(--ui-color-paper)')
  })

  it('表单控件描边：line-control 槽位与 --ui-border-control 语义别名在浅暗两档落位', () => {
    // 浅色档：rest 与 line-strong 同值（视觉不变），strong 深一档形成真实 hover 分层
    expect(rootDecls.get('--ui-color-line-control')).toBe('#D5D1C6')
    expect(rootDecls.get('--ui-color-line-control-strong')).toBe('#BEB9AC')
    expect(themeDecls.get('--ui-color-line-control')).toBe('#D5D1C6')
    expect(themeDecls.get('--ui-color-line-control-strong')).toBe('#BEB9AC')
    expect(rootDecls.get('--ui-border-control')).toBe('var(--ui-color-line-control)')
    expect(rootDecls.get('--ui-border-control-strong')).toBe('var(--ui-color-line-control-strong)')
    expect(themeDecls.get('--ui-border-control')).toBe('var(--ui-color-line-control)')
    expect(themeDecls.get('--ui-border-control-strong')).toBe('var(--ui-color-line-control-strong)')
    // 深色档：control 对夜底 / 抬升底 / dusk 实测 3.75 / 3.43 / 3.13:1（WCAG 1.4.11 ≥3），
    // strong 为 hover 提亮档（≥4:1）
    expect(darkDecls.get('--ui-color-line-control')).toBe('#7A7466')
    expect(darkDecls.get('--ui-color-line-control-strong')).toBe('#948F82')
    expect(darkDecls.get('--ui-border-control')).toBe('var(--ui-color-line-control)')
    expect(darkDecls.get('--ui-border-control-strong')).toBe('var(--ui-color-line-control-strong)')
  })

  it('有意保持浅色的槽位不随档反转（代码块深底浅字设计依赖 ink-950/paper）', () => {
    for (const name of [
      '--ui-color-paper', '--ui-color-paper-raised', '--ui-color-sand',
      '--ui-color-ink-950', '--ui-color-ink-900', '--ui-color-ink-600', '--ui-color-ink-400',
    ]) {
      expect(darkDecls.get(name)).toBe(rootDecls.get(name))
    }
  })
})
