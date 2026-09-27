// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；挂载前不渲染浮层，仅输出稳定的 hidden 占位（含 ui- 根类）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Drawer from './Drawer.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Drawer ssr', () => {
  it('renderToString 无异常且包含 ui-drawer 根类（hidden 占位）', async () => {
    const html = await render(() => h(Drawer))
    expect(html).toContain('ui-drawer')
    expect(html).toContain('hidden')
  })

  it('挂载前不渲染浮层：输出无 role=dialog / 遮罩 / 面板', async () => {
    const html = await render(() => h(Drawer, { modelValue: true }))
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('aria-modal')
    expect(html).not.toContain('ui-drawer__scrim')
    expect(html).not.toContain('ui-drawer__panel')
  })

  it('浮层内容不进入 SSR 输出（header/正文文本不随 Teleport 泄出）', async () => {
    const html = await render(() =>
      h(Drawer, { modelValue: true }, { header: () => '详情侧栏', default: () => '正文内容' }),
    )
    expect(html).not.toContain('详情侧栏')
    expect(html).not.toContain('正文内容')
  })

  it('同 props 两次渲染输出一致（占位稳定，可安全水合）', async () => {
    const node = () => h(Drawer, { modelValue: true, side: 'left', size: 'lg' })
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })

  it('关闭态 SSR 输出同样稳定（与打开态同为占位）', async () => {
    const html = await render(() => h(Drawer))
    expect(html).toContain('ui-drawer')
    expect(html).toContain('hidden')
  })

  it('非模态（modal=false）SSR 输出同为占位，不渲染面板结构', async () => {
    const html = await render(() => h(Drawer, { modelValue: true, modal: false }))
    expect(html).toContain('ui-drawer')
    expect(html).toContain('hidden')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('ui-drawer__panel')
  })
})
