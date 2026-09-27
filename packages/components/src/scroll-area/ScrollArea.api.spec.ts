// api spec：props 默认值与档位类 / emits 声明 / slots 渲染（ScrollArea）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollArea from './ScrollArea.vue'
import { SCROLL_AREA_DIRECTION_DEFAULT, SCROLL_AREA_TYPE_DEFAULT } from './ScrollArea.constants'

describe('ScrollArea api', () => {
  it('渲染 ui-scroll-area 根容器（div）：viewport + 两条装饰滚动条骨架', () => {
    const wrapper = mount(ScrollArea)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-scroll-area')
    expect(wrapper.find('.ui-scroll-area__viewport').exists()).toBe(true)
    expect(wrapper.find('.ui-scroll-area__content').exists()).toBe(true)
    expect(wrapper.find('.ui-scroll-area__bar--vertical').exists()).toBe(true)
    expect(wrapper.find('.ui-scroll-area__bar--horizontal').exists()).toBe(true)
    expect(wrapper.find('.ui-scroll-area__thumb--vertical').exists()).toBe(true)
    expect(wrapper.find('.ui-scroll-area__thumb--horizontal').exists()).toBe(true)
  })

  it('默认档：type=auto / direction=vertical 档位类落位', () => {
    const wrapper = mount(ScrollArea)
    expect(SCROLL_AREA_TYPE_DEFAULT).toBe('auto')
    expect(SCROLL_AREA_DIRECTION_DEFAULT).toBe('vertical')
    expect(wrapper.classes()).toContain('ui-scroll-area--auto')
    expect(wrapper.classes()).toContain('ui-scroll-area--direction-vertical')
    expect(wrapper.classes()).not.toContain('ui-scroll-area--always')
    expect(wrapper.classes()).not.toContain('ui-scroll-area--direction-both')
  })

  it('type / direction 档位类随 props 切换', async () => {
    const wrapper = mount(ScrollArea, { props: { type: 'always', direction: 'both' } })
    expect(wrapper.classes()).toContain('ui-scroll-area--always')
    expect(wrapper.classes()).toContain('ui-scroll-area--direction-both')
    await wrapper.setProps({ type: 'hover', direction: 'horizontal' })
    expect(wrapper.classes()).toContain('ui-scroll-area--hover')
    expect(wrapper.classes()).not.toContain('ui-scroll-area--always')
    expect(wrapper.classes()).toContain('ui-scroll-area--direction-horizontal')
  })

  it('默认插槽内容渲染进 viewport 的内容包裹层', () => {
    const wrapper = mount(ScrollArea, { slots: { default: () => '一段很长的会话记录' } })
    const viewport = wrapper.find('.ui-scroll-area__viewport')
    expect(viewport.text()).toContain('一段很长的会话记录')
    expect(wrapper.find('.ui-scroll-area__content').text()).toContain('一段很长的会话记录')
  })

  it('emits 选项声明 scroll 事件', () => {
    const emitsOption = (ScrollArea as unknown as { emits?: string[] }).emits
    expect(emitsOption).toContain('scroll')
  })

  it('expose update 方法（手动重测）', () => {
    const wrapper = mount(ScrollArea)
    expect(typeof (wrapper.vm as unknown as { update?: unknown }).update).toBe('function')
  })
})
