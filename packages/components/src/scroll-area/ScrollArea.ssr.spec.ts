// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类、viewport、
// 插槽内容与 aria-hidden 装饰条骨架（测量态初始为未溢出）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import ScrollArea from './ScrollArea.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('ScrollArea ssr', () => {
  it('renderToString 无异常且包含 ui-scroll-area 根类与 viewport', async () => {
    const html = await render(() => h(ScrollArea))
    expect(html).toContain('ui-scroll-area')
    expect(html).toContain('ui-scroll-area__viewport')
    expect(html).toContain('<div')
  })

  it('SSR 直出默认插槽内容与默认档位类（auto / vertical）', async () => {
    const html = await render(() => h(ScrollArea, null, { default: () => '一篇很长的文章内容' }))
    expect(html).toContain('一篇很长的文章内容')
    expect(html).toContain('ui-scroll-area--auto')
    expect(html).toContain('ui-scroll-area--direction-vertical')
  })

  it('装饰滚动条以 aria-hidden 骨架随 SSR 输出（服务端即声明对辅助技术隐藏）', async () => {
    const html = await render(() => h(ScrollArea))
    expect(html).toContain('ui-scroll-area__bar--vertical')
    expect(html).toContain('ui-scroll-area__bar--horizontal')
    expect(html).toContain('ui-scroll-area__thumb')
    expect(html).toContain('aria-hidden="true"')
  })

  it('type / direction 档位类随 SSR 输出', async () => {
    const html = await render(() => h(ScrollArea, { type: 'always', direction: 'both' }))
    expect(html).toContain('ui-scroll-area--always')
    expect(html).toContain('ui-scroll-area--direction-both')
  })

  it('viewport 键盘可达属性（tabindex="0"）随 SSR 输出', async () => {
    const html = await render(() => h(ScrollArea))
    expect(html).toContain('tabindex="0"')
  })
})
