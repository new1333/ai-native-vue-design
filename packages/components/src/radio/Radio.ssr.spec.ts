// @vitest-environment node
// ssr spec：node 环境 renderToString 无异常，包含 ui-radio 根类；attrs 透传 SSR 落位（RadioGroup 的用例见 RadioGroup.*.spec.ts）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Radio from './Radio.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Radio ssr', () => {
  it('renderToString 无异常且包含 ui-radio 根类', async () => {
    const html = await render(() => h(Radio, { value: 'a', label: '甲' }))
    expect(html).toContain('ui-radio')
    expect(html).toContain('<input')
  })

  it('attrs 透传在 SSR 即落位原生 radio', async () => {
    const html = await render(() => h(Radio, { value: 'a', 'aria-label': '第一项', 'data-testid': 'r1' }))
    expect(html).toMatch(/<input[^>]*aria-label="第一项"/)
    expect(html).toMatch(/<input[^>]*data-testid="r1"/)
  })
})
