// api spec：props 默认值 / emits 声明 / slots 渲染 / attrs 落位 / 脱组退化。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ToggleGroup from './ToggleGroup.vue'
import ToggleItem from './ToggleItem.vue'

const items = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙' },
]

describe('ToggleGroup api', () => {
  it('渲染 ui-toggle-group 根（div）；默认 single/segmented：role=radiogroup + 形态修饰类', () => {
    const wrapper = mount(ToggleGroup, { props: { items } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-toggle-group')
    expect(wrapper.classes()).toContain('ui-toggle-group--segmented')
    expect(wrapper.classes()).not.toContain('ui-toggle-group--multiple')
    expect(wrapper.attributes('role')).toBe('radiogroup')
  })

  it('默认无禁用；未传 items 且无插槽时不渲染任何项按钮', () => {
    const wrapper = mount(ToggleGroup)
    expect(wrapper.classes()).not.toContain('ui-toggle-group--disabled')
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('items prop：逐项渲染按钮并回退 option.label 文案', () => {
    const wrapper = mount(ToggleGroup, { props: { items } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons.map((b) => b.text())).toEqual(['甲', '乙', '丙'])
  })

  it('type=multiple：role=group + multiple 修饰类', () => {
    const wrapper = mount(ToggleGroup, { props: { items, type: 'multiple' } })
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.classes()).toContain('ui-toggle-group--multiple')
  })

  it('variant=outline：outline 形态修饰类落组根与各单项', () => {
    const wrapper = mount(ToggleGroup, { props: { items, variant: 'outline' } })
    expect(wrapper.classes()).toContain('ui-toggle-group--outline')
    expect(wrapper.find('button').classes()).toContain('ui-toggle-item--outline')
  })

  it('disabled：整组修饰类 + 各项按钮原生 disabled', () => {
    const wrapper = mount(ToggleGroup, { props: { items, disabled: true } })
    expect(wrapper.classes()).toContain('ui-toggle-group--disabled')
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.classes()).toContain('ui-toggle-item--disabled')
    }
  })

  it('items 单项 disabled：仅该按钮 disabled', () => {
    const wrapper = mount(ToggleGroup, {
      props: { items: [items[0]!, { ...items[1]!, disabled: true }, items[2]!] },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('disabled')).toBeUndefined()
    expect(buttons[1]!.attributes('disabled')).toBeDefined()
    expect(buttons[2]!.attributes('disabled')).toBeUndefined()
  })

  it('默认插槽：手动组合 ToggleItem 渲染为组内按钮', () => {
    const wrapper = mount(ToggleGroup, {
      slots: {
        default: () => [
          h(ToggleItem, { value: 'x', label: '子项一' }),
          h(ToggleItem, { value: 'y' }, { default: () => '子项二' }),
        ],
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]!.text()).toBe('子项一')
    expect(buttons[1]!.text()).toBe('子项二') // 默认插槽优先于 label prop
  })

  it('item 作用域插槽：定制每个内部项内容（携带 option 与选中态）', () => {
    const wrapper = mount(ToggleGroup, {
      props: { items, modelValue: 'b' },
      slots: {
        item: ({ item, selected }: { item: { label: string }; selected: boolean }) =>
          h('span', { class: 'rich' }, `${item.label}-${selected}`),
      },
    })
    const rich = wrapper.findAll('.rich')
    expect(rich.map((node) => node.text())).toEqual(['甲-false', '乙-true', '丙-false'])
  })

  it('无 item 插槽：回退 option.label；label prop 与插槽等价', () => {
    const wrapper = mount(ToggleGroup, { props: { items } })
    expect(wrapper.find('button').text()).toBe('甲')
  })

  it('update:modelValue 与 change 均已声明：点击以该值发出两个事件', async () => {
    const wrapper = mount(ToggleGroup, { props: { items } })
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['a']])
    expect(wrapper.emitted('change')).toEqual([['a']])
  })

  it('attrs 落组容器（role 元素）：aria-label 随根输出', () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attrs: { 'aria-label': '视图切换' } })
    expect(wrapper.attributes('aria-label')).toBe('视图切换')
  })

  it('expose.focus 已声明（焦点行为见 a11y spec）', () => {
    const wrapper = mount(ToggleGroup, { props: { items }, attachTo: document.body })
    expect(typeof (wrapper.vm as { focus: unknown }).focus).toBe('function')
    wrapper.unmount()
  })

  it('ToggleItem 脱离组独立使用：退化为无 role / 无 tabindex / 无选中联动的普通按钮', async () => {
    const wrapper = mount(ToggleItem, { props: { value: 'a', label: '甲' } })
    expect(wrapper.classes()).toContain('ui-toggle-item')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('aria-checked')).toBeUndefined()
    expect(wrapper.attributes('aria-pressed')).toBeUndefined()
    await wrapper.trigger('click') // 无组可联动：不发任何事件
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
