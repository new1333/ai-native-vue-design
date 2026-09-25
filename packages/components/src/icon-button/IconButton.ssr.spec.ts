// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui-icon-button 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import IconButton from './IconButton.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('IconButton ssr', () => {
  it('renderToString 无异常且包含 ui-icon-button 根类', async () => {
    const html = await render(() => h(IconButton, { 'aria-label': '关闭' }))
    expect(html).toContain('ui-icon-button')
    expect(html).toContain('<button')
  })

  it('默认档：ghost / md / type=button 随 SSR 输出', async () => {
    const html = await render(() =>
      h(IconButton, { 'aria-label': '关闭' }, { default: () => h('svg', { viewBox: '0 0 24 24' }) }),
    )
    expect(html).toContain('ui-icon-button--ghost')
    expect(html).toContain('ui-icon-button--md')
    expect(html).toContain('type="button"')
  })

  it('variant / size / 插槽全量渲染', async () => {
    const html = await render(() =>
      h(
        IconButton,
        { variant: 'primary', size: 'lg', 'aria-label': '保存' },
        { default: () => h('svg', { viewBox: '0 0 24 24' }) },
      ),
    )
    expect(html).toContain('ui-icon-button--primary')
    expect(html).toContain('ui-icon-button--lg')
    expect(html).toContain('ui-icon-button__icon')
  })

  it('loading：aria-busy="true" 与 spinner 随 SSR 输出（无浏览器 API 访问）', async () => {
    const html = await render(() => h(IconButton, { loading: true, 'aria-label': '保存' }))
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('ui-icon-button__spinner')
  })

  it('disabled：原生 disabled 随 SSR 输出', async () => {
    const html = await render(() => h(IconButton, { disabled: true, 'aria-label': '删除' }))
    expect(html).toContain('disabled')
  })

  it('可访问名随 SSR 输出：aria-label / aria-labelledby', async () => {
    const labelled = await render(() => h(IconButton, { 'aria-label': '关闭' }))
    expect(labelled).toContain('aria-label="关闭"')

    const by = await render(() => h(IconButton, { 'aria-labelledby': 'close-hint' }))
    expect(by).toContain('aria-labelledby="close-hint"')
  })
})
