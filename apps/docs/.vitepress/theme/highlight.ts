/**
 * 「查看源码」面板的运行时语法高亮。
 *
 * 与 vitepress 配置保持同一主题 github-dark（见 .vitepress/config.ts 的 markdown.theme），
 * 深底浅字、和围栏代码块观感一致。shiki 走动态 import：语法/主题按需加载为独立 chunk，
 * 首次展开源码时才拉取，不增大首屏体积。
 */

type ShikiModule = typeof import('shiki')

let shikiPromise: Promise<ShikiModule> | null = null

export async function highlight(source: string, lang: string): Promise<string> {
  shikiPromise ??= import('shiki')
  const { codeToHtml } = await shikiPromise
  try {
    return codeToHtml(source, { lang, theme: 'github-dark' })
  } catch {
    // 未知语言等场景降级为纯文本，保证源码始终可见
    return `<pre class="shiki"><code>${source.replace(/[<>&]/g, ch => (
      ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : '&amp;'
    ))}</code></pre>`
  }
}
