// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Badge from './Badge.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Badge ssr', () => {
  it('renderToString 无异常且包含 ui-badge 根类', async () => {
    const html = await render(() => h(Badge, null, { default: () => '进行中' }))
    expect(html).toContain('ui-badge')
    expect(html).toContain('<span')
    expect(html).toContain('进行中')
  })

  it('默认档：variant=neutral 随 SSR 输出，无 dot', async () => {
    const html = await render(() => h(Badge))
    expect(html).toContain('ui-badge--neutral')
    expect(html).not.toContain('ui-badge__dot')
  })

  it('variant 与 dot 全量随 SSR 输出', async () => {
    const html = await render(() => h(Badge, { variant: 'warning', dot: true }, { default: () => '待审核' }))
    expect(html).toContain('ui-badge--warning')
    expect(html).toContain('ui-badge__dot')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('待审核')
  })

  it('attrs 透传在 SSR 即落位根元素（data-testid）', async () => {
    const html = await render(() => h(Badge, { 'data-testid': 'ssr-badge' }))
    expect(html).toMatch(/<span[^>]*data-testid="ssr-badge"/)
  })
})
