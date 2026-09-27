// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Suggestion from './Suggestion.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Suggestion ssr', () => {
  it('renderToString 无异常且包含 ui-suggestion 根类与 role=group', async () => {
    const html = await render(() => h(Suggestion, { items: [] }))
    expect(html).toContain('ui-suggestion')
    expect(html).toContain('role="group"')
  })

  it('items 渲染：chip 数量与 label 随 SSR 输出', async () => {
    const html = await render(() =>
      h(Suggestion, {
        items: [
          { label: '总结要点', value: '请总结本次讨论的要点' },
          { label: '给出示例', value: '请给出一个可运行的示例' },
        ],
      }),
    )
    expect(html).toContain('ui-suggestion__item')
    expect(html).toContain('总结要点')
    expect(html).toContain('给出示例')
    expect(html).toContain('type="button"')
  })

  it('disabled：整组与单项的原生 disabled 随 SSR 输出', async () => {
    const all = await render(() =>
      h(Suggestion, {
        items: [{ label: '总结要点', value: 'a' }],
        disabled: true,
      }),
    )
    expect(all).toContain('disabled')

    const single = await render(() =>
      h(Suggestion, {
        items: [
          { label: '可用', value: 'a' },
          { label: '禁用', value: 'b', disabled: true },
        ],
      }),
    )
    expect(single).toContain('disabled')
  })

  it('loading：根级 aria-busy="true" 随 SSR 输出且 chips 保持可聚焦', async () => {
    const html = await render(() =>
      h(Suggestion, { items: [{ label: '总结要点', value: 'a' }], loading: true }),
    )
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain('disabled')
  })

  it('default 与 item 插槽随 SSR 输出（无浏览器 API 访问）', async () => {
    const html = await render(() =>
      h(
        Suggestion,
        { items: [{ label: '总结要点', value: 'a' }] },
        {
          default: () => h('span', '推荐追问'),
          item: ({ item }: { item: { label: string } }) => h('em', item.label),
        },
      ),
    )
    expect(html).toContain('ui-suggestion__prefix')
    expect(html).toContain('推荐追问')
    expect(html).toContain('<em>总结要点</em>')
  })
})
