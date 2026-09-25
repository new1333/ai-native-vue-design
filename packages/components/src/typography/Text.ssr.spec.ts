// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Text from './Text.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Text ssr', () => {
  it('renderToString 无异常且包含 ui-text 根类', async () => {
    const html = await render(() => h(Text, null, { default: () => '正文' }))
    expect(html).toContain('ui-text')
    expect(html).toContain('<span')
    expect(html).toContain('正文')
  })

  it('默认档：md / weight-regular / text-1 随 SSR 输出，无 numeric', async () => {
    const html = await render(() => h(Text))
    expect(html).toContain('ui-text--md')
    expect(html).toContain('ui-text--weight-regular')
    expect(html).toContain('ui-text--text-1')
    expect(html).not.toContain('ui-text--numeric')
  })

  it('as / size / weight / color / numeric 全量随 SSR 输出', async () => {
    const html = await render(() =>
      h(Text, { as: 'p', size: 'lg', weight: 600, color: 'muted', numeric: true }, { default: () => '1,024.00' }),
    )
    expect(html).toContain('<p')
    expect(html).toContain('ui-text--lg')
    expect(html).toContain('ui-text--weight-semibold')
    expect(html).toContain('ui-text--muted')
    expect(html).toContain('ui-text--numeric')
    expect(html).toContain('1,024.00')
  })

  it('attrs 透传在 SSR 即落位根元素（id）', async () => {
    const html = await render(() => h(Text, { id: 'ssr-text' }))
    expect(html).toMatch(/<span[^>]*id="ssr-text"/)
  })
})
