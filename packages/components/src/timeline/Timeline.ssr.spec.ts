// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约结构。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Timeline from './Timeline.vue'
import { TIMELINE_PENDING_TEXT } from './Timeline.constants'
import type { TimelineItem } from './Timeline.types'

const items: TimelineItem[] = [
  { title: '订单创建', description: '用户下单成功', time: '09:12' },
  { title: '订单支付', time: '09:30' },
]

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Timeline ssr', () => {
  it('renderToString 无异常且包含 ui-timeline 根类、role="list"/"listitem"', async () => {
    const html = await render(() => h(Timeline, { items }))
    expect(html).toContain('ui-timeline')
    expect(html).toContain('role="list"')
    expect(html).toContain('role="listitem"')
    expect((html.match(/ui-timeline__item(?!--)/g) ?? []).length).toBe(2)
  })

  it('items 内容随 SSR 输出：title/description/time 全部渲染', async () => {
    const html = await render(() => h(Timeline, { items }))
    expect(html).toContain('订单创建')
    expect(html).toContain('用户下单成功')
    expect(html).toContain('09:12')
    expect(html).toContain('订单支付')
  })

  it('pending：幽灵节点类、pending 圆点与默认文案随 SSR 输出', async () => {
    const html = await render(() => h(Timeline, { items, pending: true }))
    expect(html).toContain('ui-timeline__item--pending')
    expect(html).toContain('ui-timeline__dot-core--pending')
    expect(html).toContain(TIMELINE_PENDING_TEXT)
  })

  it('mode=alternate：ui-timeline--alternate 修饰类随 SSR 输出', async () => {
    const html = await render(() => h(Timeline, { items, mode: 'alternate' }))
    expect(html).toContain('ui-timeline--alternate')
    expect(html).toContain('ui-timeline__item--left-side')
  })

  it('footer 插槽内容随 SSR 输出', async () => {
    const html = await render(() =>
      h(Timeline, { items }, { footer: () => h('button', { type: 'button' }, '加载更多') }),
    )
    expect(html).toContain('ui-timeline__footer')
    expect(html).toContain('加载更多')
  })

  it('item/dot 插槽内容随 SSR 输出', async () => {
    const html = await render(() =>
      h(Timeline, { items, pending: true }, {
        item: ({ item }: { item: TimelineItem }) => h('em', `自定义-${item.title}`),
        dot: () => h('i', { class: 'custom-dot' }),
      }),
    )
    expect(html).toContain('自定义-订单创建')
    expect(html).toContain('custom-dot')
    expect(html).not.toContain('ui-timeline__title')
    expect(html).not.toContain('ui-timeline__dot-core')
  })

  it('空 items：仅渲染列表骨架（pending 缺省时不输出任何 li）', async () => {
    const html = await render(() => h(Timeline, { items: [] }))
    expect(html).toContain('ui-timeline')
    expect(html).not.toContain('ui-timeline__item')
  })
})
