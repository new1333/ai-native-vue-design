// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 区块根类。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import CardBody from './CardBody.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('CardBody ssr', () => {
  it('renderToString 无异常且包含 ui-card__body 区块根类与内容', async () => {
    const html = await render(() => h(CardBody, null, { default: () => '最近一次部署于 2 小时前完成。' }))
    expect(html).toContain('ui-card__body')
    expect(html).toContain('最近一次部署于 2 小时前完成。')
  })
})
