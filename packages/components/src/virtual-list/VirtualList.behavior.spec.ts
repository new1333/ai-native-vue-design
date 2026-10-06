// behavior spec：滚动窗口平移 / 事件透传 / 不劫持滚动 / 命令式滚动 expose / 数据响应式 / headless windowing 数学。
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { ref } from 'vue'
import type { DefineComponent } from 'vue'
import VirtualList from './VirtualList.vue'
import { useVirtualList } from './useVirtualList'
import type { VirtualListExpose, VirtualListProps } from './VirtualList.types'

interface Row {
  id: number
  label: string
}

const rows: Row[] = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `item-${i}` }))

/** 泛型组件的 T 无法经 VTU mount 推断：以 Row 实参显式收窄桥接（显式类型桥接，非 any）。 */
const VirtualListFixture = VirtualList as unknown as DefineComponent<VirtualListProps<Row>>

const ESTIMATED = 32
// 假定视口 600/32：scrollTop = 3200（第 100 项起点）时窗口 95..123（含 overscan 5）。
const SCROLLED_START = 95
const SCROLLED_END = 123

function mountList(props: Partial<VirtualListProps<Row>> = {}): VueWrapper {
  return mount(VirtualListFixture, {
    props: {
      items: rows,
      estimatedItemSize: ESTIMATED,
      getKey: (row: Row) => row.id,
      ...props,
    },
    slots: { item: ({ item }: { item: Row }) => item.label },
  })
}

function itemTexts(wrapper: VueWrapper): string[] {
  return wrapper.findAll('.ui-virtual-list__item').map((item) => item.text())
}

/** 泛型组件经 VTU mount 后的暴露方法（显式类型桥接，非 any）。 */
function exposed(wrapper: VueWrapper): VirtualListExpose {
  return wrapper.vm as unknown as VirtualListExpose
}

describe('VirtualList behavior', () => {
  it('挂载首帧发出 visibleRangeChange（假定视口推导的首屏窗口）', () => {
    const wrapper = mountList()
    const ranges = wrapper.emitted('visibleRangeChange')
    expect(ranges).toHaveLength(1)
    expect(ranges?.[0]?.[0]).toEqual({ start: 0, end: 23 })
  })

  it('滚动驱动窗口平移：scroll 透传 + visibleRangeChange 载荷 { start, end }', async () => {
    const wrapper = mountList()
    ;(wrapper.element as HTMLElement).scrollTop = 3200
    await wrapper.trigger('scroll')

    const scrollEvents = wrapper.emitted('scroll')
    expect(scrollEvents).toHaveLength(1)
    expect(scrollEvents?.[0]?.[0]).toBeInstanceOf(Event)

    const ranges = wrapper.emitted('visibleRangeChange')
    expect(ranges).toHaveLength(2)
    expect(ranges?.[1]?.[0]).toEqual({ start: SCROLLED_START, end: SCROLLED_END })

    const texts = itemTexts(wrapper)
    expect(texts).toHaveLength(SCROLLED_END - SCROLLED_START + 1)
    expect(texts[0]).toBe(`item-${SCROLLED_START}`)
    expect(texts[texts.length - 1]).toBe(`item-${SCROLLED_END}`)
  })

  it('不劫持原生滚动：不 preventDefault、从不代写 scrollTop', async () => {
    const wrapper = mountList()
    ;(wrapper.element as HTMLElement).scrollTop = 3200
    await wrapper.trigger('scroll')

    const event = new Event('scroll', { cancelable: true })
    wrapper.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect((wrapper.element as HTMLElement).scrollTop).toBe(3200) // 偏移只被读取，不被组件改写
    expect(wrapper.emitted('scroll')).toHaveLength(2) // 原生事件照常透传
    // 偏移未变 → 窗口未变 → 不再发 visibleRangeChange
    expect(wrapper.emitted('visibleRangeChange')).toHaveLength(2)
  })

  it('overscan 控制滚动缓冲：置 0 后窗口收敛到可视推导项', async () => {
    const wrapper = mountList({ overscan: 0 })
    ;(wrapper.element as HTMLElement).scrollTop = 3200
    await wrapper.trigger('scroll')
    const ranges = wrapper.emitted('visibleRangeChange')
    expect(ranges?.[ranges.length - 1]?.[0]).toEqual({ start: 100, end: 118 })
    expect(wrapper.findAll('.ui-virtual-list__item')).toHaveLength(19)
  })

  it('数据变化响应式：删除前 50 项后窗口内容随新下标平移', async () => {
    const wrapper = mountList()
    ;(wrapper.element as HTMLElement).scrollTop = 3200
    await wrapper.trigger('scroll')
    expect(itemTexts(wrapper)[0]).toBe('item-95')

    await wrapper.setProps({ items: rows.slice(50) })
    // 新数据下窗口起点（下标 95）= 原第 145 项；原下标 95 的 item-95 已滚出窗口。
    expect(itemTexts(wrapper)[0]).toBe('item-145')
    expect(itemTexts(wrapper)).not.toContain('item-95')
  })

  it('追加 items：内容层总尺寸随前缀和增长', async () => {
    const wrapper = mountList()
    await wrapper.setProps({ items: [...rows, { id: 1000, label: 'item-1000' }] })
    const inner = wrapper.find('.ui-virtual-list__inner')
    expect((inner.attributes('style') ?? '').replace(/\s/g, '')).toContain('height:32032px')
  })

  it('数据清空 → 空态；恢复非空 → 窗口项回归', async () => {
    const wrapper = mountList()
    await wrapper.setProps({ items: [] })
    expect(wrapper.find('.ui-virtual-list__empty').exists()).toBe(true)
    expect(wrapper.findAll('.ui-virtual-list__item')).toHaveLength(0)

    await wrapper.setProps({ items: rows.slice(0, 3) })
    expect(wrapper.find('.ui-virtual-list__empty').exists()).toBe(false)
    expect(itemTexts(wrapper)).toEqual(['item-0', 'item-1', 'item-2'])
  })

  it('horizontal：scrollLeft 同样驱动窗口平移', async () => {
    const wrapper = mountList({ horizontal: true })
    ;(wrapper.element as HTMLElement).scrollLeft = 3200
    await wrapper.trigger('scroll')
    const ranges = wrapper.emitted('visibleRangeChange')
    expect(ranges?.[ranges.length - 1]?.[0]).toEqual({ start: SCROLLED_START, end: SCROLLED_END })
    expect(itemTexts(wrapper)[0]).toBe(`item-${SCROLLED_START}`)
  })

  // ── 命令式滚动（defineExpose：scrollToOffset / scrollToIndex）─────────────
  it('scrollToOffset：写入原生 scrollTop 并同步内部偏移驱动窗口平移（不依赖 scroll 事件）', async () => {
    const wrapper = mountList()
    exposed(wrapper).scrollToOffset(3200)
    await nextTick()
    expect((wrapper.element as HTMLElement).scrollTop).toBe(3200)
    const ranges = wrapper.emitted('visibleRangeChange')
    expect(ranges).toHaveLength(2)
    expect(ranges?.[1]?.[0]).toEqual({ start: SCROLLED_START, end: SCROLLED_END })
    const texts = itemTexts(wrapper)
    expect(texts[0]).toBe(`item-${SCROLLED_START}`)
    expect(texts[texts.length - 1]).toBe(`item-${SCROLLED_END}`)

    // 负值/非有限数收敛为 0。
    exposed(wrapper).scrollToOffset(-50)
    await nextTick()
    expect((wrapper.element as HTMLElement).scrollTop).toBe(0)
    expect(wrapper.emitted('visibleRangeChange')?.at(-1)?.[0]).toEqual({ start: 0, end: 23 })
  })

  it('scrollToIndex：默认 start 对齐到项起点（固定高度下确定性断言）', async () => {
    const wrapper = mountList()
    exposed(wrapper).scrollToIndex(100)
    await nextTick()
    expect((wrapper.element as HTMLElement).scrollTop).toBe(3200) // 100 × 32
    expect(itemTexts(wrapper)[0]).toBe(`item-${SCROLLED_START}`)

    // 越界收敛到 [0, items.length - 1]。
    exposed(wrapper).scrollToIndex(-20)
    await nextTick()
    expect((wrapper.element as HTMLElement).scrollTop).toBe(0)
    exposed(wrapper).scrollToIndex(5000)
    await nextTick()
    expect((wrapper.element as HTMLElement).scrollTop).toBe(999 * 32) // 31968
  })

  it('scrollToIndex align：end 收敛到「项底贴视口底」、center 居中（视口按假定 600 推导）', async () => {
    const wrapper = mountList()
    exposed(wrapper).scrollToIndex(100, 'end')
    await nextTick()
    // 3200 - 600 + 32 = 2632：第 100 项底边对齐视口底边。
    expect((wrapper.element as HTMLElement).scrollTop).toBe(2632)
    expect(itemTexts(wrapper)[0]).toBe('item-77')
    expect(itemTexts(wrapper).at(-1)).toBe('item-105')

    exposed(wrapper).scrollToIndex(100, 'center')
    await nextTick()
    // 3200 - (600 - 32) / 2 = 2916：第 100 项与视口中线对齐。
    expect((wrapper.element as HTMLElement).scrollTop).toBe(2916)
    expect(itemTexts(wrapper)[0]).toBe('item-86')
    expect(itemTexts(wrapper).at(-1)).toBe('item-114')
  })

  it('horizontal：scrollToOffset 写 scrollLeft（主轴跟随 horizontal）', async () => {
    const wrapper = mountList({ horizontal: true })
    exposed(wrapper).scrollToOffset(3200)
    await nextTick()
    expect((wrapper.element as HTMLElement).scrollLeft).toBe(3200)
    expect((wrapper.element as HTMLElement).scrollTop).toBe(0)
    expect(itemTexts(wrapper)[0]).toBe(`item-${SCROLLED_START}`)
  })

  it('headless：useVirtualList 已测尺寸收敛前缀和，滚动驱动混合测量/估算的窗口', () => {
    const scrollOffset = ref(0)
    const viewportSize = ref(60)
    const state = useVirtualList<string>({
      items: ['a', 'b', 'c'],
      getKey: (item) => item,
      estimatedItemSize: 32,
      overscan: 0,
      scrollOffset,
      viewportSize,
    })
    // 未测量：全按估算。
    expect(state.totalSize.value).toBe(96)
    expect(state.range.value).toEqual({ start: 0, end: 1 }) // 60/32 → 末个相交项 1

    // 键 'a' 实测 100px：前缀和随之收敛。
    state.measuredSizes.value.set('a', 100)
    expect(state.totalSize.value).toBe(164)
    expect(state.offsets.value).toEqual([0, 100, 132, 164])

    // 滚动到 120（落在 'b' 区间 [100,132)）：窗口 = [1, 2]。
    scrollOffset.value = 120
    expect(state.range.value).toEqual({ start: 1, end: 2 })
    expect(state.windowItems.value.map((entry) => entry.key)).toEqual(['b', 'c'])
    expect(state.windowItems.value[0]).toMatchObject({ start: 100, size: 32 })
  })

  it('headless：items 变化后清理尺寸缓存中不存在的键（防长会话无界增长）', async () => {
    const items = ref(['a', 'b', 'c'])
    const scrollOffset = ref(0)
    const state = useVirtualList<string>({
      items,
      getKey: (item) => item,
      estimatedItemSize: 32,
      overscan: 0,
      scrollOffset,
      viewportSize: ref(600),
    })
    state.measuredSizes.value.set('a', 100)
    state.measuredSizes.value.set('b', 64)
    state.measuredSizes.value.set('c', 10)
    expect(state.totalSize.value).toBe(174)

    items.value = ['b', 'd'] // 'a'/'c' 键随项移除，'b' 保留，'d' 新增
    await nextTick()
    expect(state.measuredSizes.value.has('a')).toBe(false)
    expect(state.measuredSizes.value.has('c')).toBe(false)
    expect(state.measuredSizes.value.get('b')).toBe(64) // 保留项的测量不丢
    // 前缀和重算：b=64（实测）+ d=32（估算）。
    expect(state.offsets.value).toEqual([0, 64, 96])
    expect(state.totalSize.value).toBe(96)
  })

  it('headless：overscan 负值收敛为 0；空数据窗口为 { start: 0, end: -1 }', () => {
    const scrollOffset = ref(0)
    const viewportSize = ref(600)
    const negative = useVirtualList<string>({
      items: ['a', 'b'],
      getKey: (item) => item,
      estimatedItemSize: 32,
      overscan: -3,
      scrollOffset,
      viewportSize,
    })
    expect(negative.range.value).toEqual({ start: 0, end: 1 })

    const empty = useVirtualList<string>({
      items: [],
      getKey: (item) => item,
      estimatedItemSize: 32,
      overscan: 0,
      scrollOffset,
      viewportSize,
    })
    expect(empty.range.value).toEqual({ start: 0, end: -1 })
    expect(empty.windowItems.value).toEqual([])
    expect(empty.totalSize.value).toBe(0)
  })
})
