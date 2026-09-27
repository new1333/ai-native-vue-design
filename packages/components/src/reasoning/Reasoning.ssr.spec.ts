// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui-reasoning 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Reasoning from './Reasoning.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

/** 取 SSR 输出中正文区域的开标签（hidden 断言用：全文 toContain 会误中 chevron 的 aria-hidden）。 */
function contentOpenTag(html: string): string {
  const match = html.match(/<div[^>]*class="ui-reasoning__content"[^>]*>/)
  expect(match).toBeTruthy()
  return match?.[0] ?? ''
}

describe('Reasoning ssr', () => {
  it('renderToString 无异常且包含 ui-reasoning 根类', async () => {
    const html = await render(() => h(Reasoning, { content: '思考文本' }))
    expect(html).toContain('ui-reasoning')
    expect(html).toContain('<div')
  })

  it('默认收起态随 SSR 输出：aria-expanded=false、正文 hidden、内容保留、默认文案「思考过程」', async () => {
    const html = await render(() => h(Reasoning, { content: '推理步骤' }))
    expect(html).toContain('ui-reasoning--collapsed')
    expect(html).toContain('aria-expanded="false"')
    expect(contentOpenTag(html)).toContain('hidden')
    expect(html).toContain('推理步骤')
    expect(html).toContain('思考过程')
  })

  it('挂载即 streaming：服务端直出展开态（aria-expanded=true、正文无 hidden、「思考中…」）', async () => {
    const html = await render(() => h(Reasoning, { content: '推演中', streaming: true }))
    expect(html).toContain('ui-reasoning--streaming')
    expect(html).toContain('aria-expanded="true"')
    expect(contentOpenTag(html)).not.toContain('hidden')
    expect(html).not.toContain('ui-reasoning--collapsed')
    expect(html).toContain('思考中…')
  })

  it('受控展开：expanded=true 服务端直出展开态（aria-expanded=true、正文无 hidden）', async () => {
    const html = await render(() => h(Reasoning, { content: '推理步骤', expanded: true }))
    expect(html).toContain('ui-reasoning--expanded')
    expect(html).toContain('aria-expanded="true"')
    expect(contentOpenTag(html)).not.toContain('hidden')
    expect(html).toContain('推理步骤')
  })

  it('duration 耗时文案随 SSR 输出（已思考 3.2s）', async () => {
    const html = await render(() => h(Reasoning, { content: '', duration: 3.2 }))
    expect(html).toContain('已思考 3.2s')
  })

  it('aria-controls / role=region / aria-labelledby 关联随 SSR 输出', async () => {
    const html = await render(() => h(Reasoning, { content: '思考文本' }))
    expect(html).toContain('aria-controls=')
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-labelledby=')
  })

  it('插槽内容随 SSR 输出（header 覆盖默认文案、content 覆盖默认正文）', async () => {
    const html = await render(() =>
      h(Reasoning, { content: '原文', duration: 3.2 }, {
        header: () => h('span', '深度推理'),
        content: () => h('p', '插槽正文'),
      }),
    )
    expect(html).toContain('深度推理')
    expect(html).not.toContain('已思考 3.2s')
    expect(html).toContain('插槽正文')
    expect(html).not.toContain('原文')
  })
})
