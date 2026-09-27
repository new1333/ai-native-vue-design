// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；挂载前不渲染气泡，只输出触发元素（含 ui-popconfirm 根类）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Popconfirm from './Popconfirm.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

const node = () =>
  h(
    Popconfirm,
    { title: '删除这条评论？', description: '删除后不可恢复。', danger: true },
    {
      trigger: () => h('button', { type: 'button' }, '删除'),
    },
  )

describe('Popconfirm ssr', () => {
  it('renderToString 无异常且包含 ui-popconfirm 根类', async () => {
    const html = await render(node)
    expect(html).toContain('ui-popconfirm')
  })

  it('触发元素随 SSR 输出：含 aria-expanded="false"（开合状态对读屏可见）', async () => {
    const html = await render(node)
    expect(html).toContain('<button')
    expect(html).toContain('删除')
    expect(html).toContain('aria-expanded="false"')
  })

  it('挂载前不渲染气泡：无卡片、无 role="dialog"、无标题/描述、无确认/取消按钮、无 aria-controls', async () => {
    const html = await render(node)
    expect(html).not.toContain('ui-popconfirm__card')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('删除这条评论？')
    expect(html).not.toContain('删除后不可恢复')
    expect(html).not.toContain('确认')
    expect(html).not.toContain('取消')
    expect(html).not.toContain('aria-controls')
  })

  it('同 props 两次渲染输出一致（可安全水合）', async () => {
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })
})
