// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Button from './Button.vue'
import ButtonGroup from './ButtonGroup.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('ButtonGroup ssr', () => {
  it('renderToString 无异常且包含 ui-button-group 根类', async () => {
    const html = await render(() => h(ButtonGroup))
    expect(html).toContain('ui-button-group')
    expect(html).toContain('<div')
  })

  it('SSR 输出 ui-button-group 与 role=group，size 共享在服务端即解析', async () => {
    const html = await render(() =>
      h(ButtonGroup, { size: 'sm' }, { default: () => [h(Button, { key: 'a' }), h(Button, { key: 'b' })] }),
    )
    expect(html).toContain('ui-button-group')
    expect(html).toContain('role="group"')
    expect(html).toContain('ui-button--sm')
  })
})
