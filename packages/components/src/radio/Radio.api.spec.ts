// api spec：RadioGroup/Radio 的 props 默认值、emits 声明、slots 渲染、attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Radio from './Radio.vue'
import RadioGroup from './RadioGroup.vue'
import type { RadioGroupProps } from './Radio.types'

function mountGroup(
  props: RadioGroupProps & Record<string, unknown>,
  radios: Array<{ value: string; label?: string; disabled?: boolean }> = [],
) {
  return mount(RadioGroup, {
    props,
    slots: { default: () => radios.map((r) => h(Radio, { key: r.value, ...r })) },
  })
}

describe('RadioGroup api', () => {
  it('渲染 ui-radio-group 根容器并携带 role="radiogroup"', () => {
    const wrapper = mountGroup({ name: 'plan' })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-radio-group')
    expect(wrapper.attributes('role')).toBe('radiogroup')
  })

  it('attrs 落在组容器（aria-label 等）', () => {
    const wrapper = mountGroup({ name: 'plan', 'aria-label': '套餐选择' })
    expect(wrapper.attributes('aria-label')).toBe('套餐选择')
  })

  it('未传 disabled：组内 radio 无原生 disabled；传入后整组落位', () => {
    const off = mountGroup({ name: 'a' }, [{ value: 'x' }])
    expect(off.find('input').attributes('disabled')).toBeUndefined()

    const on = mountGroup({ name: 'b', disabled: true }, [{ value: 'x' }])
    expect(on.find('input').attributes('disabled')).toBeDefined()
    expect(on.find('.ui-radio').classes()).toContain('ui-radio--disabled')
  })

  it('update:modelValue 在 RadioGroup 上声明（载荷断言见 behavior spec）', async () => {
    const wrapper = mountGroup({ name: 'c' }, [{ value: 'x', label: '甲' }])
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['x']])
  })

  it('attrs 不落入 Radio 的根 label（全部直达原生 radio）', () => {
    const wrapper = mount(Radio, { props: { value: 'a' }, attrs: { 'data-testid': 'r1' } })
    expect(wrapper.find('input').attributes('data-testid')).toBe('r1')
    expect(wrapper.attributes('data-testid')).toBeUndefined()
  })
})

describe('Radio api', () => {
  it('渲染 ui-radio 根（label 元素）与原生 radio 控件', () => {
    const wrapper = mount(Radio, { props: { value: 'a', label: '甲' } })
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.classes()).toContain('ui-radio')
    const control = wrapper.find('input')
    expect(control.element.tagName).toBe('INPUT')
    expect(control.attributes('type')).toBe('radio')
  })

  it('独立使用（无组上下文）：不注水 name，不选中，不抛错', () => {
    const wrapper = mount(Radio, { props: { value: 'a' } })
    expect(wrapper.find('input').attributes('name')).toBeUndefined()
    expect(wrapper.find('input').attributes('checked')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-radio--checked')
  })

  it('组内：name 由组下发到每个原生 radio；选中项随 modelValue 落 checked 与修饰类', () => {
    const wrapper = mountGroup(
      { name: 'plan', modelValue: 'b' },
      [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }],
    )
    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(2)
    expect(inputs[0]?.attributes('name')).toBe('plan')
    expect(inputs[1]?.attributes('name')).toBe('plan')
    expect(inputs[1]?.attributes('checked')).toBeDefined()
    expect(wrapper.findAll('.ui-radio')[1]?.classes()).toContain('ui-radio--checked')
    expect(wrapper.findAll('.ui-radio')[0]?.classes()).not.toContain('ui-radio--checked')
  })

  it('单项 disabled：仅该项落原生 disabled（整组 disabled 取或）', () => {
    const wrapper = mountGroup(
      { name: 'plan' },
      [{ value: 'a' }, { value: 'b', disabled: true }],
    )
    const inputs = wrapper.findAll('input')
    expect(inputs[0]?.attributes('disabled')).toBeUndefined()
    expect(inputs[1]?.attributes('disabled')).toBeDefined()
  })

  it('label prop 渲染到专属文本节点；默认插槽优先', () => {
    const byProp = mount(Radio, { props: { value: 'a', label: '甲' } })
    expect(byProp.find('.ui-radio__label').text()).toBe('甲')

    const bySlot = mount(Radio, { props: { value: 'a', label: 'prop' }, slots: { default: () => h('b', '插槽') } })
    expect(bySlot.find('.ui-radio__label').text()).toBe('插槽')
  })

  it('无 label prop 且无插槽：不渲染文本节点（可读名称由使用方经 attrs 提供）', () => {
    expect(mount(Radio, { props: { value: 'a' } }).find('.ui-radio__label').exists()).toBe(false)
  })
})
