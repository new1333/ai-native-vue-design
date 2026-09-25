// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Divider from './Divider.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Divider ssr', () => {
  it('renderToString 无异常且默认输出语义 <hr> 与 ui-divider 根类', async () => {
    const html = await render(() => h(Divider))
    expect(html).toContain('<hr')
    expect(html).toContain('ui-divider')
    expect(html).toContain('ui-divider--horizontal')
  })

  it('垂直：role="separator" 与 aria-orientation="vertical" 随 SSR 输出', async () => {
    const html = await render(() => h(Divider, { direction: 'vertical' }))
    expect(html).toContain('ui-divider--vertical')
    expect(html).toContain('role="separator"')
    expect(html).toContain('aria-orientation="vertical"')
  })

  it('水平带标签：div[role="separator"]、标签与两侧细线随 SSR 输出', async () => {
    const html = await render(() => h(Divider, null, { label: () => '或' }))
    expect(html).toContain('ui-divider--labeled')
    expect(html).toContain('role="separator"')
    expect(html).toContain('ui-divider__label')
    expect(html).toContain('或')
    expect(html).toContain('ui-divider__line')
  })

  it('attrs 透传在 SSR 即落位根元素（id）', async () => {
    const html = await render(() => h(Divider, { id: 'ssr-divider' }))
    expect(html).toMatch(/<hr[^>]*id="ssr-divider"/)
  })
})
