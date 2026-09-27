// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类、修饰类与插槽内容。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Space from './Space.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Space ssr', () => {
  it('renderToString 无异常且默认输出 ui-space 根类与默认修饰类', async () => {
    const html = await render(() => h(Space))
    expect(html).toContain('ui-space')
    expect(html).toContain('ui-space--row')
    expect(html).toContain('ui-space--md')
    expect(html).toContain('ui-space--align-center')
    expect(html).not.toContain('ui-space--wrap')
  })

  it('column / lg / wrap / align 组合：修饰类随 SSR 输出', async () => {
    const html = await render(() => h(Space, { direction: 'column', size: 'lg', wrap: true, align: 'start' }))
    expect(html).toContain('ui-space--column')
    expect(html).toContain('ui-space--lg')
    expect(html).toContain('ui-space--wrap')
    expect(html).toContain('ui-space--align-start')
    expect(html).not.toContain('ui-space--row')
  })

  it('默认插槽子元素随 SSR 直出（无逐子元素包裹层）', async () => {
    const html = await render(() =>
      h(Space, null, {
        default: () => [h('span', '甲'), h('span', '乙')],
      }),
    )
    expect(html).toContain('甲')
    expect(html).toContain('乙')
    expect(html).toContain('<span')
    expect((html.match(/<span/g) ?? []).length).toBe(2)
  })

  it('attrs 透传在 SSR 即落位根元素（id / data-testid）', async () => {
    const html = await render(() => h(Space, { id: 'ssr-space', 'data-testid': 'actions' }))
    expect(html).toMatch(/<div[^>]*id="ssr-space"/)
    expect(html).toMatch(/<div[^>]*data-testid="actions"/)
  })
})
