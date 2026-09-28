/**
 * useListNavigation spec —— 下拉列表高亮导航状态机（纯逻辑直测，无 DOM）：
 * 可选集合内移动/夹住、边缘跳转、打开落位（已选优先）、落位点通知。
 */
import { describe, expect, it } from 'vitest'
import { useListNavigation } from './useListNavigation'

interface TestItem {
  disabled?: boolean
}

/** 由条目数组推导可选下标（同各组件的 enabledIndexes 纪律）。 */
function enabledOf(items: TestItem[]): number[] {
  return items.flatMap((item, index) => (item.disabled ? [] : [index]))
}

function setup(items: TestItem[], selected = -1) {
  const heard: number[] = []
  const nav = useListNavigation({
    enabledIndexes: () => enabledOf(items),
    selectedIndex: () => selected,
    onActiveIndexChange: (index) => heard.push(index),
  })
  return { nav, heard }
}

describe('useListNavigation', () => {
  it('初始无高亮（-1）', () => {
    const { nav } = setup([{ disabled: true }, {}])
    expect(nav.activeIndex.value).toBe(-1)
  })

  it('moveActive：跳过禁用项并在两端夹住（不环绕）', () => {
    // 可选下标：0、2、4（1、3 禁用）
    const { nav } = setup([{}, { disabled: true }, {}, { disabled: true }, {}])

    nav.setActive(0)
    nav.moveActive(1)
    expect(nav.activeIndex.value).toBe(2)
    nav.moveActive(1)
    expect(nav.activeIndex.value).toBe(4)
    nav.moveActive(1)
    expect(nav.activeIndex.value).toBe(4)

    nav.moveActive(-1)
    nav.moveActive(-1)
    nav.moveActive(-1)
    expect(nav.activeIndex.value).toBe(0)
  })

  it('moveActive：当前不在可选集合内时按方向取端点', () => {
    const { nav } = setup([{}, { disabled: true }, {}])
    nav.moveActive(1)
    expect(nav.activeIndex.value).toBe(0)

    nav.setActive(-1)
    nav.moveActive(-1)
    expect(nav.activeIndex.value).toBe(2)
  })

  it('可选集合为空：导航一律 no-op', () => {
    const { nav } = setup([{ disabled: true }])
    nav.moveActive(1)
    nav.toEdge('first')
    expect(nav.activeIndex.value).toBe(-1)
  })

  it('toEdge：首个/末个可选项', () => {
    const { nav } = setup([{}, { disabled: true }, {}, { disabled: true }, {}])
    nav.toEdge('last')
    expect(nav.activeIndex.value).toBe(4)
    nav.toEdge('first')
    expect(nav.activeIndex.value).toBe(0)
  })

  it('initialActiveIndex：已选（若仍可选）优先，否则 edge 端首个可选', () => {
    const { nav } = setup([{}, { disabled: true }, {}], 2)
    expect(nav.initialActiveIndex('first')).toBe(2)

    // 已选项已禁用：回落到 edge 端
    const drifted = setup([{}, { disabled: true }, { disabled: true }], 2)
    expect(drifted.nav.initialActiveIndex('first')).toBe(0)
    expect(drifted.nav.initialActiveIndex('last')).toBe(0)

    const none = setup([{}, {}, {}])
    expect(none.nav.initialActiveIndex('first')).toBe(0)
    expect(none.nav.initialActiveIndex('last')).toBe(2)
  })

  it('setActive：唯一落位点，触发 onActiveIndexChange', () => {
    const { nav, heard } = setup([{}, {}, {}])
    nav.setActive(1)
    nav.moveActive(1)
    nav.toEdge('first')
    expect(heard).toEqual([1, 2, 0])
  })
})
