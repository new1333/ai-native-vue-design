// a11y spec：装饰滚动条 aria-hidden、viewport 可聚焦且原生键盘滚动不被拦截、不劫持语义。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollArea from './ScrollArea.vue'

describe('ScrollArea a11y', () => {
  it('装饰滚动条对辅助技术隐藏：两条 bar 均带 aria-hidden="true"', () => {
    const wrapper = mount(ScrollArea)
    expect(wrapper.find('.ui-scroll-area__bar--vertical').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.ui-scroll-area__bar--horizontal').attributes('aria-hidden')).toBe('true')
  })

  it('装饰条与拇指不可聚焦：无 tabindex，不产生 role="scrollbar" 交互语义', () => {
    const wrapper = mount(ScrollArea)
    for (const selector of [
      '.ui-scroll-area__bar--vertical',
      '.ui-scroll-area__bar--horizontal',
      '.ui-scroll-area__thumb--vertical',
      '.ui-scroll-area__thumb--horizontal',
    ]) {
      const el = wrapper.find(selector)
      expect(el.attributes('tabindex')).toBeUndefined()
      expect(el.attributes('role')).toBeUndefined()
    }
  })

  it('viewport 键盘可达：tabindex="0"，键盘用户可 Tab 进入并原生滚动', () => {
    const wrapper = mount(ScrollArea)
    expect(wrapper.find('.ui-scroll-area__viewport').attributes('tabindex')).toBe('0')
    // 根容器自身不可聚焦，不重复占用 Tab 序
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('viewport 保持泛型滚动语义：不设 role，不劫持 landmark', () => {
    const wrapper = mount(ScrollArea)
    expect(wrapper.find('.ui-scroll-area__viewport').attributes('role')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('组件不拦截键盘路径：方向键 keydown 未被消费、未被 preventDefault（原生滚动继续生效）', () => {
    const wrapper = mount(ScrollArea)
    // 组件未声明 keydown 监听：不消费键盘事件
    const emitsOption = (ScrollArea as unknown as { emits?: string[] }).emits ?? []
    expect(emitsOption).not.toContain('keydown')

    // 方向键 / 翻页键在 viewport 上派发：默认行为不被阻止，冒泡完整到达根元素
    const bubbled: Event[] = []
    wrapper.find('.ui-scroll-area').element.addEventListener('keydown', (e) => bubbled.push(e))
    const viewport = wrapper.find('.ui-scroll-area__viewport')
    const keys = ['ArrowDown', 'PageUp', 'Home']
    keys.forEach((key, index) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      viewport.element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
      expect(bubbled).toHaveLength(index + 1)
    })
  })

  it('插槽内容对读屏自然可读：内容包裹层无 aria-hidden', () => {
    const wrapper = mount(ScrollArea, { slots: { default: () => '第 1 行日志' } })
    const content = wrapper.find('.ui-scroll-area__content')
    expect(content.attributes('aria-hidden')).toBeUndefined()
    expect(content.text()).toContain('第 1 行日志')
  })
})
