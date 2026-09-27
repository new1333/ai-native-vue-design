// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；挂载前不渲染浮层，仅输出稳定的 hidden 占位（含 ui- 根类）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Artifact from './Artifact.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Artifact ssr', () => {
  it('renderToString 无异常且包含 ui-artifact 根类（hidden 占位）', async () => {
    const html = await render(() => h(Artifact, { title: '标题' }))
    expect(html).toContain('ui-artifact')
    expect(html).toContain('hidden')
  })

  it('挂载前不渲染浮层：输出无 role=dialog / 遮罩 / 面板 / 操作栏', async () => {
    const html = await render(() => h(Artifact, { modelValue: true, title: '标题' }))
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('aria-modal')
    expect(html).not.toContain('ui-artifact__scrim')
    expect(html).not.toContain('ui-artifact__panel')
    expect(html).not.toContain('ui-artifact__actions')
  })

  it('浮层内容不进入 SSR 输出（标题/正文/徽标文本不随 Teleport 泄出）', async () => {
    const html = await render(() =>
      h(Artifact, { modelValue: true, title: '排序工具函数', language: 'TypeScript' }, { default: () => '正文内容' }),
    )
    expect(html).not.toContain('排序工具函数')
    expect(html).not.toContain('TypeScript')
    expect(html).not.toContain('正文内容')
  })

  it('同 props 两次渲染输出一致（占位稳定，可安全水合）', async () => {
    const node = () => h(Artifact, { modelValue: true, type: 'markdown', title: '标题' })
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })

  it('关闭态 SSR 输出同样稳定（与打开态同为占位）', async () => {
    const html = await render(() => h(Artifact))
    expect(html).toContain('ui-artifact')
    expect(html).toContain('hidden')
  })
})
