// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；挂载前不渲染浮层，仅输出稳定的 hidden 占位（含 ui- 根类）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Tooltip from './Tooltip.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

const node = () =>
  h(
    Tooltip,
    { placement: 'top' },
    {
      default: () => h('button', { type: 'button' }, '保存'),
      content: () => '保存当前草稿',
    },
  )

describe('Tooltip ssr', () => {
  it('renderToString 无异常且包含 ui-tooltip 根类（hidden 占位）', async () => {
    const html = await render(node)
    expect(html).toContain('ui-tooltip')
    expect(html).toContain('hidden')
  })

  it('挂载前不渲染浮层：无 role="tooltip"、无 aria-describedby、无提示内容', async () => {
    const html = await render(node)
    expect(html).not.toContain('role="tooltip"')
    expect(html).not.toContain('aria-describedby')
    expect(html).not.toContain('保存当前草稿')
  })

  it('触发元素随 SSR 输出（无包装 DOM，占位为兄弟节点）', async () => {
    const html = await render(node)
    expect(html).toContain('<button')
    expect(html).toContain('保存')
    // 占位 span 不包裹触发元素：二者为兄弟关系
    expect(html).not.toMatch(/<span[^>]*ui-tooltip[^>]*>\s*<button/)
  })

  it('同 props 两次渲染输出一致（占位稳定，可安全水合）', async () => {
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })
})
