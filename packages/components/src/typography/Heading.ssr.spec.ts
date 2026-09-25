// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Heading from './Heading.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Heading ssr', () => {
  it('renderToString 无异常且包含 ui-heading 根类与默认 h2', async () => {
    const html = await render(() => h(Heading, null, { default: () => '区块标题' }))
    expect(html).toContain('ui-heading')
    expect(html).toContain('<h2')
    expect(html).toContain('区块标题')
  })

  it('默认档：xl / weight-semibold / text-1 随 SSR 输出，无 numeric', async () => {
    const html = await render(() => h(Heading))
    expect(html).toContain('ui-heading--xl')
    expect(html).toContain('ui-heading--weight-semibold')
    expect(html).toContain('ui-heading--text-1')
    expect(html).not.toContain('ui-heading--numeric')
  })

  it('as / size / weight / color / numeric 全量随 SSR 输出', async () => {
    const html = await render(() =>
      h(Heading, { as: 'h1', size: '2xl', weight: 400, color: 'muted', numeric: true }, { default: () => '2026' }),
    )
    expect(html).toContain('<h1')
    expect(html).toContain('ui-heading--2xl')
    expect(html).toContain('ui-heading--weight-regular')
    expect(html).toContain('ui-heading--muted')
    expect(html).toContain('ui-heading--numeric')
    expect(html).toContain('2026')
  })

  it('attrs 透传在 SSR 即落位根元素（id）', async () => {
    const html = await render(() => h(Heading, { id: 'ssr-heading' }))
    expect(html).toMatch(/<h2[^>]*id="ssr-heading"/)
  })
})
