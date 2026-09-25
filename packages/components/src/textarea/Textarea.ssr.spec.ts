// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Textarea from './Textarea.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Textarea ssr', () => {
  it('renderToString 无异常且包含 ui-textarea 根类与原生 textarea', async () => {
    const html = await render(() => h(Textarea))
    expect(html).toContain('ui-textarea')
    expect(html).toContain('<textarea')
  })

  it('默认档：rows="3"、resize-vertical 与 default 修饰类随 SSR 输出，无 aria-invalid/disabled', async () => {
    const html = await render(() => h(Textarea, { placeholder: '描述' }))
    expect(html).toContain('rows="3"')
    expect(html).toContain('placeholder="描述"')
    expect(html).toContain('ui-textarea--resize-vertical')
    expect(html).toContain('ui-textarea--default')
    expect(html).not.toContain('aria-invalid')
    expect(html).not.toContain('disabled')
    expect(html).not.toContain('ui-textarea__count')
  })

  it('受控值随 SSR 渲染为 textarea 内容；maxlength / readonly / disabled 全量输出', async () => {
    const html = await render(() =>
      h(Textarea, { modelValue: '多行\n内容', maxlength: 32, readonly: true, disabled: true }),
    )
    expect(html).toContain('多行')
    expect(html).toContain('maxlength="32"')
    expect(html).toContain('readonly')
    expect(html).toContain('disabled')
  })

  it('showCount：字数统计（x/y）随 SSR 输出', async () => {
    const html = await render(() => h(Textarea, { showCount: true, maxlength: 10, modelValue: 'abc' }))
    expect(html).toContain('ui-textarea__count')
    expect(html).toContain('3/10')
  })

  it('status=error：aria-invalid="true" 与 ui-textarea--error 随 SSR 输出', async () => {
    const html = await render(() => h(Textarea, { status: 'error' }))
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('ui-textarea--error')
  })

  it('attrs 透传在 SSR 即落位原生 textarea（id / aria-describedby）', async () => {
    const html = await render(() => h(Textarea, { id: 'ssr-area', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<textarea[^>]*id="ssr-area"/)
    expect(html).toMatch(/<textarea[^>]*aria-describedby="tip"/)
  })
})
