// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import PromptInput from './PromptInput.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('PromptInput ssr', () => {
  it('renderToString 无异常且包含 ui-prompt-input 根类、原生 textarea 与内建发送按钮', async () => {
    const html = await render(() => h(PromptInput))
    expect(html).toContain('ui-prompt-input')
    expect(html).toContain('<textarea')
    expect(html).toContain('aria-label="发送"')
  })

  it('默认档：rows="1"、max-height token calc（8 行）与 placeholder 随 SSR 输出，无 disabled/loading', async () => {
    const html = await render(() => h(PromptInput, { placeholder: '给 AI 的提示词' }))
    expect(html).toContain('rows="1"')
    expect(html).toContain('placeholder="给 AI 的提示词"')
    expect(html).toContain('max-height:calc(var(--ui-text-md) * var(--ui-leading-small) * 8)')
    expect(html).not.toContain('ui-prompt-input--disabled')
    expect(html).not.toContain('ui-prompt-input--loading')
    // 空值时内建发送按钮禁用是预期契约；textarea 自身不得出现 disabled
    expect(html).not.toMatch(/<textarea[^>]*disabled/)
  })

  it('受控值随 SSR 渲染为 textarea 内容；maxRows 变更反映到 calc 行数', async () => {
    const html = await render(() => h(PromptInput, { modelValue: '多行\n提示词', maxRows: 4 }))
    expect(html).toContain('多行')
    expect(html).toContain('max-height:calc(var(--ui-text-md) * var(--ui-leading-small) * 4)')
  })

  it('disabled：textarea 与内建按钮均随 SSR 输出原生 disabled', async () => {
    const html = await render(() => h(PromptInput, { modelValue: '服务维护中', disabled: true }))
    expect(html).toContain('ui-prompt-input--disabled')
    expect(html).toMatch(/<textarea[^>]*disabled/)
    expect(html).toMatch(/<button[^>]*disabled/)
  })

  it('loading：ui-prompt-input--loading 修饰类与停止按钮 aria-label 随 SSR 输出', async () => {
    const html = await render(() => h(PromptInput, { modelValue: '生成中', loading: true }))
    expect(html).toContain('ui-prompt-input--loading')
    expect(html).toContain('aria-label="停止"')
  })

  it('attrs 透传在 SSR 即落位原生 textarea（id / aria-describedby）', async () => {
    const html = await render(() => h(PromptInput, { id: 'ssr-prompt', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<textarea[^>]*id="ssr-prompt"/)
    expect(html).toMatch(/<textarea[^>]*aria-describedby="tip"/)
  })

  it('具名插槽（prefix / suffix / actions）随 SSR 输出，actions 与内建发送按钮并存', async () => {
    const html = await render(() =>
      h(PromptInput, { modelValue: 'x' }, {
        prefix: () => h('span', '上下文标签'),
        suffix: () => h('span', 'Enter 发送 · Shift+Enter 换行'),
        actions: () => h('button', { type: 'button' }, '插入模板'),
      }),
    )
    expect(html).toContain('上下文标签')
    expect(html).toContain('Enter 发送 · Shift+Enter 换行')
    expect(html).toContain('插入模板')
    // actions 为增量扩展：内建发送按钮仍在
    expect(html).toContain('aria-label="发送"')
  })
})
