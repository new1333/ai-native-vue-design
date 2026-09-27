// api spec：props 默认值（均分 / 方向）/ panes 约束读取 / emits 声明 / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Splitter from './Splitter.vue'
import SplitterPane from './SplitterPane.vue'

function styleOf(dom: { attributes: (name: string) => string | undefined }): string {
  return (dom.attributes('style') ?? '').replace(/\s+/g, '')
}

function mountPanes(props: Record<string, unknown> = {}, paneCount = 2) {
  return mount(Splitter, {
    props,
    slots: {
      default: () =>
        Array.from({ length: paneCount }, (_, i) =>
          h(SplitterPane, { key: i }, { default: () => `面板 ${i}` }),
        ),
    },
  })
}

describe('Splitter api', () => {
  it('渲染 ui-splitter 根容器（div），默认方向为 ui-splitter--horizontal', () => {
    const wrapper = mountPanes()
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-splitter')
    expect(wrapper.classes()).toContain('ui-splitter--horizontal')
    expect(wrapper.classes()).not.toContain('ui-splitter--vertical')
  })

  it('direction="vertical"：ui-splitter--vertical 修饰类落位', () => {
    const wrapper = mountPanes({ direction: 'vertical' })
    expect(wrapper.classes()).toContain('ui-splitter--vertical')
  })

  it('默认插槽的 SplitterPane 序列决定面板数量：2 pane → 2 区域 + 1 分隔条', () => {
    const wrapper = mountPanes({}, 2)
    expect(wrapper.findAll('.ui-splitter__pane')).toHaveLength(2)
    expect(wrapper.findAll('.ui-splitter__handle')).toHaveLength(1)
  })

  it('3 pane → 3 区域 + 2 分隔条', () => {
    const wrapper = mountPanes({}, 3)
    expect(wrapper.findAll('.ui-splitter__pane')).toHaveLength(3)
    expect(wrapper.findAll('.ui-splitter__handle')).toHaveLength(2)
  })

  it('默认未受控：面板均分（flex-basis 50% / 50%）', () => {
    const wrapper = mountPanes()
    const panes = wrapper.findAll('.ui-splitter__pane')
    expect(styleOf(panes[0]!)).toContain('flex-basis:50%')
    expect(styleOf(panes[1]!)).toContain('flex-basis:50%')
  })

  it('modelValue=[70,30]：受控尺寸按归一化百分比落位', () => {
    const wrapper = mountPanes({ modelValue: [70, 30] })
    const panes = wrapper.findAll('.ui-splitter__pane')
    expect(styleOf(panes[0]!)).toContain('flex-basis:70%')
    expect(styleOf(panes[1]!)).toContain('flex-basis:30%')
  })

  it('modelValue 长度与面板数不符：回退均分（不越界渲染）', () => {
    const wrapper = mountPanes({ modelValue: [10] })
    const panes = wrapper.findAll('.ui-splitter__pane')
    expect(styleOf(panes[0]!)).toContain('flex-basis:50%')
    expect(styleOf(panes[1]!)).toContain('flex-basis:50%')
  })

  it('modelValue 含非法值（负数）：整组回退均分', () => {
    const wrapper = mountPanes({ modelValue: [-5, 105] })
    const panes = wrapper.findAll('.ui-splitter__pane')
    expect(styleOf(panes[0]!)).toContain('flex-basis:50%')
  })

  it('panes 数组约束读取：分隔条 aria-valuemin/aria-valuemax 反映主面板 min/max', () => {
    const wrapper = mountPanes({ panes: [{ min: 20, max: 80 }] })
    const handle = wrapper.find('.ui-splitter__handle')
    expect(handle.attributes('aria-valuemin')).toBe('20')
    expect(handle.attributes('aria-valuemax')).toBe('80')
  })

  it('panes 未声明的面板用缺省约束（min 0 / max 100）', () => {
    const wrapper = mountPanes({ panes: [{ collapsible: true }] })
    const handle = wrapper.find('.ui-splitter__handle')
    expect(handle.attributes('aria-valuemin')).toBe('0')
    expect(handle.attributes('aria-valuemax')).toBe('100')
  })

  it('SplitterPane 内容渲染进内容盒 ui-splitter__pane-content', () => {
    const wrapper = mountPanes({}, 2)
    const contents = wrapper.findAll('.ui-splitter__pane-content')
    expect(contents).toHaveLength(2)
    expect(contents[0]!.text()).toBe('面板 0')
    expect(contents[1]!.text()).toBe('面板 1')
  })

  it('非 SplitterPane 的子节点被忽略：不产生面板区域、不渲染', () => {
    const wrapper = mount(Splitter, {
      slots: {
        default: () => [
          h('div', { class: 'stray' }, '游离节点'),
          h(SplitterPane, { key: 0 }, { default: () => '面板 0' }),
          h(SplitterPane, { key: 1 }, { default: () => '面板 1' }),
        ],
      },
    })
    expect(wrapper.findAll('.ui-splitter__pane')).toHaveLength(2)
    expect(wrapper.find('.stray').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('游离节点')
  })

  it('emits 声明：update:modelValue / resize / collapse 三个事件', () => {
    const emitsOption = (Splitter as unknown as { emits?: string[] }).emits
    expect(emitsOption).toBeDefined()
    expect(emitsOption).toContain('update:modelValue')
    expect(emitsOption).toContain('resize')
    expect(emitsOption).toContain('collapse')
  })

  it('初始未交互：不触发任何事件', () => {
    const wrapper = mountPanes({ modelValue: [60, 40] })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('resize')).toBeUndefined()
    expect(wrapper.emitted('collapse')).toBeUndefined()
  })
})
