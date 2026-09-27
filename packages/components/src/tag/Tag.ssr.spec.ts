// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Tag from './Tag.vue'
import { TAG_CLOSE_ARIA_LABEL } from './Tag.constants'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Tag ssr', () => {
  it('renderToString 无异常且包含 ui-tag 根类', async () => {
    const html = await render(() => h(Tag, null, { default: () => '前端' }))
    expect(html).toContain('ui-tag')
    expect(html).toContain('<span')
    expect(html).toContain('前端')
  })

  it('默认档：variant=neutral 随 SSR 输出，无关闭按钮、无 icon 位、无 aria-disabled', async () => {
    const html = await render(() => h(Tag))
    expect(html).toContain('ui-tag--neutral')
    expect(html).not.toContain('ui-tag__close')
    expect(html).not.toContain('ui-tag__icon')
    expect(html).not.toContain('aria-disabled')
  })

  it('closable + variant 全量随 SSR 输出（aria-label、aria-hidden 的 X 图标）', async () => {
    const html = await render(() => h(Tag, { variant: 'warning', closable: true }, { default: () => '待复核' }))
    expect(html).toContain('ui-tag--warning')
    expect(html).toContain('ui-tag__close')
    expect(html).toContain(`aria-label="${TAG_CLOSE_ARIA_LABEL}"`)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('待复核')
  })

  it('disabled + closable：aria-disabled 与按钮 disabled 随 SSR 输出', async () => {
    const html = await render(() => h(Tag, { closable: true, disabled: true }))
    expect(html).toContain('ui-tag--disabled')
    expect(html).toMatch(/<span[^>]*aria-disabled="true"/)
    expect(html).toMatch(/<button[^>]*disabled/)
  })

  it('icon 插槽内容随 SSR 输出', async () => {
    const html = await render(() =>
      h(Tag, null, { icon: () => h('svg', { viewBox: '0 0 24 24' }), default: () => 'VIP' }),
    )
    expect(html).toContain('ui-tag__icon')
    expect(html).toContain('<svg')
    expect(html).toContain('VIP')
  })

  it('attrs 透传在 SSR 即落位根元素（data-testid）', async () => {
    const html = await render(() => h(Tag, { 'data-testid': 'ssr-tag' }))
    expect(html).toMatch(/<span[^>]*data-testid="ssr-tag"/)
  })
})
