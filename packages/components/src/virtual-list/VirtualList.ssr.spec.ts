// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；按假定视口直出首屏窗口；根类与插槽契约输出。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { DefineComponent, VNode } from 'vue'
import VirtualList from './VirtualList.vue'
import type { VirtualListProps } from './VirtualList.types'

interface Row {
  id: number
  label: string
}

const rows: Row[] = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `item-${i}` }))

/** 泛型组件的 T 无法经 h 推断：以 Row 实参显式收窄桥接（显式类型桥接，非 any）。 */
const VirtualListFixture = VirtualList as unknown as DefineComponent<VirtualListProps<Row>>

const ESTIMATED = 32
// 假定视口 600 / 估算 32：SSR 直出首屏窗口 0..23（含末端 overscan 5）。
const FIRST_WINDOW_END = 23

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

function countOccurrences(html: string, needle: string): number {
  return html.split(needle).length - 1
}

describe('VirtualList ssr', () => {
  it('renderToString 无异常且包含 ui-virtual-list 根类与内容层', async () => {
    const html = await render(() =>
      h(VirtualListFixture, { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id }),
    )
    expect(html).toContain('ui-virtual-list')
    expect(html).toContain('ui-virtual-list__inner')
    expect(html).toContain('tabindex="0"')
  })

  it('直出首屏窗口：恰为 24 个窗口项（item-0 … item-23），窗口外项不出现在文档', async () => {
    const html = await render(() =>
      h(
        VirtualListFixture,
        { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
        { item: ({ item }: { item: Row }) => item.label },
      ),
    )
    expect(countOccurrences(html, 'class="ui-virtual-list__item"')).toBe(FIRST_WINDOW_END + 1)
    expect(html).toContain('item-0')
    expect(html).toContain(`item-${FIRST_WINDOW_END}`)
    expect(html).not.toContain('item-24')
    expect(html).not.toContain('item-999')
  })

  it('内容层总尺寸随 SSR 输出（撑起原生滚动条）', async () => {
    const html = await render(() =>
      h(VirtualListFixture, { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id }),
    )
    expect(html.replace(/\s/g, '')).toContain('height:32000px')
  })

  it('horizontal 修饰类与 left 定位随 SSR 输出', async () => {
    const html = await render(() =>
      h(VirtualListFixture, {
        items: rows,
        estimatedItemSize: ESTIMATED,
        horizontal: true,
        getKey: (row: Row) => row.id,
      }),
    )
    expect(html).toContain('ui-virtual-list--horizontal')
    expect(html.replace(/\s/g, '')).toContain('width:32000px')
  })

  it('空态：默认文案「暂无数据」随 SSR 输出', async () => {
    const html = await render(() =>
      h(VirtualListFixture, { items: [], estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id }),
    )
    expect(html).toContain('ui-virtual-list__empty')
    expect(html).toContain('暂无数据')
  })

  it('aria-label 透传与 role="region" 随 SSR 输出；item 插槽内容随 SSR 输出', async () => {
    const html = await render(() =>
      h(
        VirtualListFixture,
        {
          items: rows,
          estimatedItemSize: ESTIMATED,
          getKey: (row: Row) => row.id,
          'aria-label': '会话消息',
        },
        { item: ({ item }: { item: Row }) => `★${item.label}` },
      ),
    )
    expect(html).toContain('aria-label="会话消息"')
    expect(html).toContain('role="region"')
    expect(html).toContain('★item-0')
    expect(html).toContain(`★item-${FIRST_WINDOW_END}`)
  })

  it('empty 插槽覆盖默认空态随 SSR 输出', async () => {
    const html = await render(() =>
      h(
        VirtualListFixture,
        { items: [], estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
        { empty: () => '还没有消息' },
      ),
    )
    expect(html).toContain('还没有消息')
    expect(html).not.toContain('暂无数据')
  })
})
