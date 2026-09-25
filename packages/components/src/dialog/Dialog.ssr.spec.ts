// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；挂载前不渲染浮层，仅输出稳定的 hidden 占位（含 ui- 根类）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Dialog from './Dialog.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Dialog ssr', () => {
  it('renderToString 无异常且包含 ui-dialog 根类（hidden 占位）', async () => {
    const html = await render(() => h(Dialog, { title: '标题' }))
    expect(html).toContain('ui-dialog')
    expect(html).toContain('hidden')
  })

  it('挂载前不渲染浮层：输出无 role=dialog / 遮罩 / 面板', async () => {
    const html = await render(() => h(Dialog, { modelValue: true, title: '标题' }))
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('aria-modal')
    expect(html).not.toContain('ui-dialog__scrim')
    expect(html).not.toContain('ui-dialog__panel')
  })

  it('浮层内容不进入 SSR 输出（正文/标题文本不随 Teleport 泄出）', async () => {
    const html = await render(() =>
      h(Dialog, { modelValue: true, title: '删除确认' }, { default: () => '正文内容' }),
    )
    expect(html).not.toContain('删除确认')
    expect(html).not.toContain('正文内容')
  })

  it('同 props 两次渲染输出一致（占位稳定，可安全水合）', async () => {
    const node = () => h(Dialog, { modelValue: true, size: 'lg', title: '标题' })
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })

  it('关闭态 SSR 输出同样稳定（与打开态同为占位）', async () => {
    const html = await render(() => h(Dialog))
    expect(html).toContain('ui-dialog')
    expect(html).toContain('hidden')
  })
})
