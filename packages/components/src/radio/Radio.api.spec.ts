// api spec：Radio 的 props 默认值、attrs 透传、slots 渲染（RadioGroup 的用例见 RadioGroup.*.spec.ts）。
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

  it('attrs 不落入 Radio 的根 label（全部直达原生 radio）', () => {
    const wrapper = mount(Radio, { props: { value: 'a' }, attrs: { 'data-testid': 'r1' } })
    expect(wrapper.find('input').attributes('data-testid')).toBe('r1')
    expect(wrapper.attributes('data-testid')).toBeUndefined()
  })
})
