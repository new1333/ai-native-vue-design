// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；直出当前 content（定格/光标占位随输出）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import StreamingText from './StreamingText.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('StreamingText ssr', () => {
  it('renderToString 无异常且包含 ui-streaming-text 根类', async () => {
    const html = await render(() => h(StreamingText, { content: '服务端直出文本' }))
    expect(html).toContain('ui-streaming-text')
    expect(html).toContain('服务端直出文本')
  })

  it('非流式：直出当前 content 全文（定格态），无光标', async () => {
    const html = await render(() => h(StreamingText, { content: '已完成的回答' }))
    expect(html).toContain('已完成的回答')
    expect(html).toContain('ui-streaming-text--done')
    expect(html).not.toContain('ui-streaming-text__cursor')
  })

  it('streaming=true：随 SSR 输出光标占位、--streaming 修饰类与 aria-busy="true"', async () => {
    const html = await render(() => h(StreamingText, { content: '生成中', streaming: true }))
    expect(html).toContain('ui-streaming-text--streaming')
    expect(html).toContain('ui-streaming-text__cursor')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('生成中')
  })

  it('aria-live="polite" 随 SSR 输出', async () => {
    const html = await render(() => h(StreamingText, { content: '文本' }))
    expect(html).toContain('aria-live="polite"')
  })

  it('markdown：空行切分的原生 <p> 段落随 SSR 输出', async () => {
    const html = await render(() =>
      h(StreamingText, { content: '第一段\n\n第二段', markdown: true }),
    )
    expect(html).toContain('ui-streaming-text--markdown')
    expect(html).toContain('<p')
    expect(html).toContain('第一段')
    expect(html).toContain('第二段')
  })

  it('attrs 透传在 SSR 即落位根元素（id）', async () => {
    const html = await render(() => h(StreamingText, { content: '文本', id: 'ssr-stream' }))
    expect(html).toMatch(/<div[^>]*id="ssr-stream"/)
  })

  it('default 插槽随 SSR 渲染已上屏文本', async () => {
    const html = await render(() =>
      h(StreamingText, { content: '插槽文本' }, { default: ({ text }: { text: string }) => h('b', text) }),
    )
    expect(html).toContain('<b')
    expect(html).toContain('插槽文本')
  })
})
