// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性（ButtonGroup 见 ButtonGroup.ssr.spec.ts）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Button from './Button.vue'
import ButtonRoot from './ButtonRoot.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Button ssr', () => {
  it('renderToString 无异常且包含 ui-button 根类', async () => {
    const html = await render(() => h(Button))
    expect(html).toContain('ui-button')
    expect(html).toContain('<button')
  })

  it('默认档：secondary / md / type=button 随 SSR 输出', async () => {
    const html = await render(() => h(Button, null, { default: () => '保存' }))
    expect(html).toContain('ui-button--secondary')
    expect(html).toContain('ui-button--md')
    expect(html).toContain('type="button"')
    expect(html).toContain('保存')
  })

  it('variant / size / block / slots 全量渲染', async () => {
    const html = await render(() =>
      h(
        Button,
        { variant: 'primary', size: 'lg', block: true },
        {
          default: () => '开始分析',
          icon: () => h('svg', { viewBox: '0 0 24 24' }),
          iconRight: () => h('svg', { viewBox: '0 0 24 24' }),
        },
      ),
    )
    expect(html).toContain('ui-button--primary')
    expect(html).toContain('ui-button--lg')
    expect(html).toContain('ui-button--block')
    expect(html).toContain('开始分析')
    expect(html).toContain('ui-button__icon--right')
  })

  it('loading：aria-busy="true" 与 spinner 随 SSR 输出（无浏览器 API 访问）', async () => {
    const html = await render(() => h(Button, { loading: true }))
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('ui-button__spinner')
  })

  it('disabled：原生 disabled 随 SSR 输出', async () => {
    const html = await render(() => h(Button, { disabled: true }))
    expect(html).toContain('disabled')
  })

  it('ButtonRoot：SSR 输出原生 button，无样式类', async () => {
    const html = await render(() => h(ButtonRoot, { type: 'submit' }, { default: () => '提交' }))
    expect(html).toContain('<button')
    expect(html).toContain('type="submit"')
  })
})
