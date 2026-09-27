// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Spinner from './Spinner.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Spinner ssr', () => {
  it('renderToString 无异常且包含 ui-spinner、role="status" 与 sr-only 可访问名', async () => {
    const html = await render(() => h(Spinner, { label: '加载中' }))
    expect(html).toContain('ui-spinner')
    expect(html).toContain('role="status"')
    expect(html).toContain('ui-spinner__label')
    expect(html).toContain('加载中')
  })

  it('spin 变体：SVG 旋转环结构与 aria-hidden 随 SSR 输出', async () => {
    const html = await render(() => h(Spinner, { label: '加载中' }))
    expect(html).toContain('ui-spinner__svg')
    expect(html).toContain('ui-spinner__ring')
    expect(html).toContain('ui-spinner__arc')
    expect(html).toContain('aria-hidden="true"')
  })

  it('dots 变体：恰好 3 个圆点随 SSR 输出、无 svg', async () => {
    const html = await render(() => h(Spinner, { label: '加载中', variant: 'dots' }))
    expect(html).toContain('ui-spinner--dots')
    expect(html).not.toContain('<svg')
    expect((html.match(/ui-spinner__dot/g) ?? []).length).toBe(3)
  })

  it('size=lg：档位修饰类随 SSR 输出', async () => {
    const html = await render(() => h(Spinner, { label: '加载中', size: 'lg' }))
    expect(html).toContain('ui-spinner--lg')
  })

  it('#label 插槽内容随 SSR 输出', async () => {
    const html = await render(
      () =>
        h(Spinner, { label: '加载中' }, { label: () => h('span', '正在同步，剩余 3 项') }),
    )
    expect(html).toContain('正在同步，剩余 3 项')
  })
})
