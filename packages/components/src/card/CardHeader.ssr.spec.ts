// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 区块根类（自 Card.ssr.spec.ts 移入的 CardHeader 断言）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import CardHeader from './CardHeader.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('CardHeader ssr', () => {
  it('renderToString 无异常且包含 ui-card__header 区块根类', async () => {
    const html = await render(() => h(CardHeader, null, { default: () => '部署概览' }))
    expect(html).toContain('ui-card__header')
    expect(html).toContain('部署概览')
  })

  it('插槽内原生标题元素随 SSR 输出（标题语义在服务端即成立）', async () => {
    const html = await render(() => h(CardHeader, null, { default: () => h('h3', '周报') }))
    expect(html).toContain('<h3')
    expect(html).toContain('周报')
  })
})
