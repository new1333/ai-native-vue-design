// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 区块根类。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import CardFooter from './CardFooter.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('CardFooter ssr', () => {
  it('renderToString 无异常且包含 ui-card__footer 区块根类与内容', async () => {
    const html = await render(() => h(CardFooter, null, { default: () => '更新于 2 小时前' }))
    expect(html).toContain('ui-card__footer')
    expect(html).toContain('更新于 2 小时前')
  })
})
