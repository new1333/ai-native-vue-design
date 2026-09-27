// a11y spec：滚动视口键盘可达 / region 地标 / 原生按键不拦截 / 空态语义。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import type { DefineComponent } from 'vue'
import VirtualList from './VirtualList.vue'
import type { VirtualListProps } from './VirtualList.types'

interface Row {
  id: number
  label: string
}

const rows: Row[] = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `item-${i}` }))

/** 泛型组件的 T 无法经 VTU mount 推断：以 Row 实参显式收窄桥接（显式类型桥接，非 any）。 */
const VirtualListFixture = VirtualList as unknown as DefineComponent<VirtualListProps<Row>>

const ESTIMATED = 32

function mountList(attrs: Record<string, string> = {}): ReturnType<typeof mount> {
  return mount(VirtualListFixture, {
    props: { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
    attrs,
  })
}

describe('VirtualList a11y', () => {
  it('滚动视口 tabindex="0"：键盘用户可 Tab 进入并用方向键/PageUp 原生滚动', () => {
    // focus 依赖文档挂载：attachTo 后验证可聚焦性，测试完卸载还原 document。
    const wrapper = mount(VirtualListFixture, {
      attachTo: document.body,
      props: { items: rows, estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
    })
    expect(wrapper.attributes('tabindex')).toBe('0')
    const el = wrapper.find('.ui-virtual-list').element as HTMLElement
    el.focus()
    expect(document.activeElement).toBe(el)
    wrapper.unmount()
  })

  it('aria-label 透传到滚动容器，并使其承担带名的 role="region" 地标', () => {
    const wrapper = mountList({ 'aria-label': '会话消息' })
    expect(wrapper.attributes('aria-label')).toBe('会话消息')
    expect(wrapper.attributes('role')).toBe('region')
  })

  it('aria-labelledby 同样成立', () => {
    const wrapper = mountList({ 'aria-labelledby': 'session-title' })
    expect(wrapper.attributes('aria-labelledby')).toBe('session-title')
    expect(wrapper.attributes('role')).toBe('region')
  })

  it('无可访问名时不写 role（避免无名 region 地标）', () => {
    const wrapper = mountList()
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('键盘路径不被拦截：ArrowDown keydown 不 preventDefault、不改变窗口（滚动交还原生）', () => {
    const wrapper = mountList()
    const el = wrapper.find('.ui-virtual-list').element as HTMLElement
    el.focus()
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    })
    el.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    // 组件不监听/消费任何按键：挂载首帧之外无新的窗口播报与滚动透传。
    expect(wrapper.emitted('visibleRangeChange')).toHaveLength(1)
    expect(wrapper.emitted('scroll')).toBeUndefined()
  })

  it('PageUp / Home 等滚动键同样不被组件消费', () => {
    const wrapper = mountList()
    const el = wrapper.find('.ui-virtual-list').element as HTMLElement
    for (const key of ['PageUp', 'PageDown', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(wrapper.emitted('scroll')).toBeUndefined()
  })

  it('空态：无窗口项，空态容器存在且可由 empty 插槽定制', () => {
    const wrapper = mount(VirtualListFixture, {
      props: { items: [], estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
      slots: { empty: () => '还没有消息' },
    })
    expect(wrapper.findAll('.ui-virtual-list__item')).toHaveLength(0)
    expect(wrapper.find('.ui-virtual-list__empty').text()).toBe('还没有消息')
  })

  it('窗口项语义由 item 插槽内容自带（可包含可交互元素）', () => {
    const wrapper = mount(VirtualListFixture, {
      props: { items: rows.slice(0, 3), estimatedItemSize: ESTIMATED, getKey: (row: Row) => row.id },
      slots: {
        item: ({ item }: { item: Row }) =>
          h('button', { type: 'button' }, `打开 ${item.label}`),
      },
    })
    const buttons = wrapper.findAll('.ui-virtual-list__item button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0]?.attributes('type')).toBe('button')
    expect(buttons[0]?.text()).toBe('打开 item-0')
  })
})
