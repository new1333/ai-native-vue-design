// api spec：组根类与 role / attrs 落容器 / 整组 disabled / name 与选中注入 / emits 声明（自 Radio.api.spec.ts 移入的 RadioGroup 断言）。
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
})
