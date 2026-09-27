// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；根类 / 均分与受控尺寸 / 分隔条 aria 契约 /
// 折叠修饰类与 SplitterPane 内容全部随 SSR 输出（useId 面板 id 服务端即成立）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Splitter from './Splitter.vue'
import SplitterPane from './SplitterPane.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

function panes(...contents: string[]): VNode[] {
  return contents.map((text, i) => h(SplitterPane, { key: i }, { default: () => text }))
}

describe('Splitter ssr', () => {
  it('renderToString 无异常且包含 ui-splitter 根类', async () => {
    const html = await render(() => h(Splitter, null, { default: () => panes('左侧', '右侧') }))
    expect(html).toContain('ui-splitter')
    expect(html).toContain('<div')
  })

  it('默认均分与分隔条随 SSR 输出（flex-basis 50% + role=separator + tabindex）', async () => {
    const html = await render(() => h(Splitter, null, { default: () => panes('左', '右') }))
    expect(html).toContain('ui-splitter--horizontal')
    expect(html).toContain('flex-basis:50%')
    expect(html).toContain('role="separator"')
    expect(html).toContain('tabindex="0"')
  })

  it('direction="vertical"：修饰类与互补 aria-orientation="horizontal" 随 SSR 输出', async () => {
    const html = await render(() =>
      h(Splitter, { direction: 'vertical' }, { default: () => panes('上', '下') }),
    )
    expect(html).toContain('ui-splitter--vertical')
    expect(html).toContain('aria-orientation="horizontal"')
  })

  it('受控尺寸与 panes 约束（aria-value*）随 SSR 输出', async () => {
    const html = await render(() =>
      h(
        Splitter,
        { modelValue: [70, 30], panes: [{ min: 20, max: 80 }] },
        { default: () => panes('主', '辅') },
      ),
    )
    expect(html).toContain('flex-basis:70%')
    expect(html).toContain('aria-valuenow="70"')
    expect(html).toContain('aria-valuemin="20"')
    expect(html).toContain('aria-valuemax="80"')
    expect(html).toContain('aria-valuetext="70%"')
  })

  it('折叠面板（尺寸 0）输出 --collapsed 修饰类，aria-valuenow 为 0', async () => {
    const html = await render(() =>
      h(Splitter, { modelValue: [0, 100], panes: [{ collapsible: true }] }, { default: () => panes('折', '展') }),
    )
    expect(html).toContain('ui-splitter__pane--collapsed')
    expect(html).toContain('aria-valuenow="0"')
  })

  it('SplitterPane 内容与内容盒 ui-splitter__pane-content 随 SSR 输出', async () => {
    const html = await render(() =>
      h(Splitter, null, { default: () => panes('对话流', '产物预览') }),
    )
    expect(html).toContain('ui-splitter__pane-content')
    expect(html).toContain('对话流')
    expect(html).toContain('产物预览')
  })

  it('aria-controls 指向的面板 id 在 SSR 输出中真实存在（useId 服务端一致）', async () => {
    const html = await render(() => h(Splitter, null, { default: () => panes('左', '右') }))
    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1]
    expect(controls).toBeDefined()
    expect(html).toContain(`id="${controls}"`)
  })

  it('分隔条内置 aria-label 缺省文案随 SSR 输出', async () => {
    const html = await render(() => h(Splitter, null, { default: () => panes('左', '右') }))
    expect(html).toContain('aria-label="调整面板尺寸"')
  })
})
