// api spec：props 默认值 / windowing 渲染 / slots 渲染 / 语义结构。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import type { DefineComponent } from 'vue'
import VirtualList from './VirtualList.vue'
import { VIRTUAL_LIST_VIEWPORT_FALLBACK } from './VirtualList.constants'
import type { VirtualListProps } from './VirtualList.types'

interface Row {
  id: number
  label: string
}

const rows: Row[] = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `item-${i}` }))

/** 泛型组件的 T 无法经 VTU mount 推断：以 Row 实参显式收窄桥接（显式类型桥接，非 any）。 */
const VirtualListFixture = VirtualList as unknown as DefineComponent<VirtualListProps<Row>>

const ESTIMATED = 32
// 无布局环境按假定视口推导首屏：600/32 = 18.75 → 末个相交项 18；scrollTop=0 时
// 起点收敛为 0，仅末端扩 overscan(5) → end = 23。
const FIRST_WINDOW_END = 23

function itemTexts(wrapper: VueWrapper): string[] {
  return wrapper.findAll('.ui-virtual-list__item').map((item) => item.text())
}

function inlineStyle(wrapper: VueWrapper, selector: string): string {
  return (wrapper.find(selector).attributes('style') ?? '').replace(/\s/g, '')
}

describe('VirtualList api', () => {
  it('语义结构：根类 ui-virtual-list，含内容层与窗口项；视口 tabindex="0" 键盘可达', () => {
    const wrapper = mount(VirtualListFixture, {
      props: { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
      slots: { item: ({ item }: { item: Row }) => item.label },
    })
    expect(wrapper.classes()).toContain('ui-virtual-list')
    expect(wrapper.find('.ui-virtual-list__inner').exists()).toBe(true)
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.findAll('.ui-virtual-list__item')).toHaveLength(FIRST_WINDOW_END + 1)
  })

  it('窗口化渲染：1000 项只渲染首屏窗口（含 overscan），远小于 items.length', () => {
    const wrapper = mount(VirtualListFixture, {
      props: { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
      slots: { item: ({ item }: { item: Row }) => item.label },
    })
    expect(rows).toHaveLength(1000)
    const texts = itemTexts(wrapper)
    expect(texts).toHaveLength(FIRST_WINDOW_END + 1)
    expect(texts[0]).toBe('item-0')
    expect(texts[texts.length - 1]).toBe(`item-${FIRST_WINDOW_END}`)
    expect(wrapper.text()).not.toContain('item-999')
  })

  it('overscan 扩缓冲：默认 5（首屏 19 项 + 末端 5）；置 0 后仅视口推导项', () => {
    const mounted = mount(VirtualListFixture, {
      props: { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
    })
    expect(mounted.findAll('.ui-virtual-list__item')).toHaveLength(FIRST_WINDOW_END + 1)

    const noOverscan = mount(VirtualListFixture, {
      props: { items: rows, estimatedItemSize: ESTIMATED, overscan: 0, getKey: (row: Row) => row.id },
    })
    expect(noOverscan.findAll('.ui-virtual-list__item')).toHaveLength(19)
  })

  it('estimatedItemSize 驱动内容层总尺寸（前缀和，数据驱动布局值）', () => {
    const wrapper = mount(VirtualListFixture, {
      props: { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
    })
    expect(inlineStyle(wrapper, '.ui-virtual-list__inner')).toContain('height:32000px')
  })

  it('窗口项按主轴前缀和定位：第 n 项 top = n * estimatedItemSize', () => {
    const wrapper = mount(VirtualListFixture, {
      props: { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
    })
    const items = wrapper.findAll('.ui-virtual-list__item')
    expect((items[0]?.attributes('style') ?? '').replace(/\s/g, '')).toContain('top:0px')
    expect((items[1]?.attributes('style') ?? '').replace(/\s/g, '')).toContain('top:32px')
  })

  it('item 插槽作用域含 item 与全局下标 index', () => {
    const wrapper = mount(VirtualListFixture, {
      props: { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
      slots: { item: ({ item, index }: { item: Row; index: number }) => `${item.label}#${index}` },
    })
    expect(itemTexts(wrapper)[0]).toBe('item-0#0')
    expect(itemTexts(wrapper)[1]).toBe('item-1#1')
  })

  it('item 插槽缺省：string/number 项渲染文本，对象项渲染为空', () => {
    const StringFixture = VirtualList as unknown as DefineComponent<VirtualListProps<string>>
    const ofStrings = mount(StringFixture, {
      props: { items: ['alpha', 'beta'], estimatedItemSize: ESTIMATED, getKey: (item: string) => item },
    })
    expect(itemTexts(ofStrings)).toEqual(['alpha', 'beta'])

    const ofRows = mount(VirtualListFixture, {
      props: { items: rows.slice(0, 2), estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
    })
    expect(itemTexts(ofRows)).toEqual(['', ''])
  })

  it('空态默认文案「暂无数据」，empty 插槽可覆盖', () => {
    const empty = mount(VirtualListFixture, {
      props: { items: [], estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
    })
    expect(empty.find('.ui-virtual-list__empty').text()).toBe('暂无数据')
    expect(empty.findAll('.ui-virtual-list__item')).toHaveLength(0)

    const custom = mount(VirtualListFixture, {
      props: { items: [], estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
      slots: { empty: () => '还没有消息' },
    })
    expect(custom.find('.ui-virtual-list__empty').text()).toBe('还没有消息')
    expect(custom.text()).not.toContain('暂无数据')
  })

  it('horizontal：根节点修饰类；窗口项以 left 定位（不再写 top）；内容层总宽度', () => {
    const wrapper = mount(VirtualListFixture, {
      props: {
        items: rows,
        estimatedItemSize: ESTIMATED,
        horizontal: true,
        getKey: (row: Row) => row.id,
      },
    })
    expect(wrapper.classes()).toContain('ui-virtual-list--horizontal')
    const items = wrapper.findAll('.ui-virtual-list__item')
    expect((items[0]?.attributes('style') ?? '').replace(/\s/g, '')).toContain('left:0px')
    expect((items[1]?.attributes('style') ?? '').replace(/\s/g, '')).toContain('left:32px')
    expect((items[1]?.attributes('style') ?? '').replace(/\s/g, '')).not.toContain('top:')
    expect(inlineStyle(wrapper, '.ui-virtual-list__inner')).toContain('width:32000px')
  })

  it('estimatedItemSize 非法输入（0）按兜底值推导：不崩溃且仍窗口化', () => {
    const wrapper = mount(VirtualListFixture, {
      props: { items: rows, estimatedItemSize: 0, getKey: (row: Row) => row.id },
    })
    // 兜底估算 1px：600/1 → 末个相交项 599，加末端 overscan(5) → end = 604。
    expect(wrapper.findAll('.ui-virtual-list__item')).toHaveLength(605)
  })

  it('假定视口常量参与首屏推导（SSR / 无布局环境口径）', () => {
    expect(VIRTUAL_LIST_VIEWPORT_FALLBACK).toBe(600)
  })
})
