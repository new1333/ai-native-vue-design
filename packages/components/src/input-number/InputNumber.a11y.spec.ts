// a11y spec：spinbutton 语义 / aria 属性 / 键盘步进与提交路径 / 焦点管理 / 步进按钮可读名称。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import InputNumber from './InputNumber.vue'
import type { InputNumberExpose } from './InputNumber.types'

describe('InputNumber a11y', () => {
  it('原生 <input> 承载 role="spinbutton"（WAI-ARIA Spinbutton 模式），type=text + inputmode=decimal', () => {
    const control = mount(InputNumber).find('input')
    expect(control.element.tagName).toBe('INPUT')
    expect(control.attributes('type')).toBe('text')
    expect(control.attributes('inputmode')).toBe('decimal')
    expect(control.attributes('role')).toBe('spinbutton')
  })

  it('aria-valuemin / aria-valuemax 仅在 min/max 有定义时渲染', () => {
    const bounded = mount(InputNumber, { props: { min: 0, max: 100 } }).find('input')
    expect(bounded.attributes('aria-valuemin')).toBe('0')
    expect(bounded.attributes('aria-valuemax')).toBe('100')
    const unbounded = mount(InputNumber).find('input')
    expect(unbounded.attributes('aria-valuemin')).toBeUndefined()
    expect(unbounded.attributes('aria-valuemax')).toBeUndefined()
  })

  it('aria-valuenow / aria-valuetext 有值时渲染且为钳制后的生效值；空值时省略', () => {
    const withValue = mount(InputNumber, { props: { modelValue: 5, precision: 2 } }).find('input')
    expect(withValue.attributes('aria-valuenow')).toBe('5')
    expect(withValue.attributes('aria-valuetext')).toBe('5.00')
    const outOfRange = mount(InputNumber, { props: { modelValue: 99, max: 10 } }).find('input')
    expect(outOfRange.attributes('aria-valuenow')).toBe('10')
    const empty = mount(InputNumber).find('input')
    expect(empty.attributes('aria-valuenow')).toBeUndefined()
    expect(empty.attributes('aria-valuetext')).toBeUndefined()
  })

  it('不改写 tabindex：input 自然进入 Tab 序', () => {
    expect(mount(InputNumber).find('input').attributes('tabindex')).toBeUndefined()
  })

  it('aria-label / aria-describedby 经 attrs 落在原生 input（可访问名称由使用方提供）', () => {
    const control = mount(InputNumber, { attrs: { 'aria-label': '数量' } }).find('input')
    expect(control.attributes('aria-label')).toBe('数量')
    expect(mount(InputNumber).find('input').attributes('aria-label')).toBeUndefined()
  })

  it('步进按钮：原生 <button type="button">、aria-label="减少"/"增加"、图标 aria-hidden', () => {
    const wrapper = mount(InputNumber)
    const decrease = wrapper.find('button.ui-input-number__decrease')
    const increase = wrapper.find('button.ui-input-number__increase')
    expect(decrease.element.tagName).toBe('BUTTON')
    expect(increase.element.tagName).toBe('BUTTON')
    expect(decrease.attributes('type')).toBe('button')
    expect(increase.attributes('type')).toBe('button')
    expect(decrease.attributes('aria-label')).toBe('减少')
    expect(increase.attributes('aria-label')).toBe('增加')
    expect(decrease.find('svg').attributes('aria-hidden')).toBe('true')
    expect(increase.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('disabled：原生 disabled（input 与按钮移出 Tab 序），不用 aria-disabled', () => {
    const wrapper = mount(InputNumber, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('input').attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.find('button.ui-input-number__decrease').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button.ui-input-number__increase').attributes('disabled')).toBeDefined()
  })

  it('键盘步进路径：↑ 递增发出 step(up) 与 update:modelValue，↓ 递减发出 step(down)', async () => {
    const value = ref<number | null>(5)
    const Host = defineComponent({
      setup: () => () =>
        h(InputNumber, {
          modelValue: value.value,
          min: 0,
          max: 10,
          'onUpdate:modelValue': (v: number | null) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const inner = wrapper.findComponent(InputNumber)
    const control = wrapper.find('input')
    control.element.focus()
    expect(document.activeElement).toBe(control.element)
    await control.trigger('keydown', { key: 'ArrowUp' })
    expect(value.value).toBe(6)
    expect(inner.emitted('step')).toEqual([['up', 6]])
    expect(inner.emitted('update:modelValue')).toEqual([[6]])
    await control.trigger('keydown', { key: 'ArrowDown' })
    expect(value.value).toBe(5)
    expect(inner.emitted('step')).toEqual([['up', 6], ['down', 5]])
    control.element.blur()
    expect(document.activeElement).not.toBe(control.element)
    wrapper.unmount()
  })

  it('键盘 PageUp / PageDown 路径：一次跨 step × 10 并发出 step 事件', async () => {
    const value = ref<number | null>(5)
    const Host = defineComponent({
      setup: () => () =>
        h(InputNumber, {
          modelValue: value.value,
          'onUpdate:modelValue': (v: number | null) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    const inner = wrapper.findComponent(InputNumber)
    const control = wrapper.find('input')
    await control.trigger('keydown', { key: 'PageUp' })
    expect(value.value).toBe(15)
    await control.trigger('keydown', { key: 'PageDown' })
    expect(value.value).toBe(5)
    expect(inner.emitted('step')).toEqual([['up', 15], ['down', 5]])
  })

  it('键盘 Home / End 路径：跳到 min / max（无该边界时不动）', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 5, min: 0, max: 100 } })
    const control = wrapper.find('input')
    await control.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]])
    await control.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[0], [100]])
    expect(wrapper.emitted('step')).toBeUndefined()
  })

  it('键盘 Enter 路径：提交草稿发出 update:modelValue 与 change', async () => {
    const wrapper = mount(InputNumber, { props: { modelValue: 1 } })
    const control = wrapper.find('input')
    await control.setValue('8')
    await control.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[8]])
    expect(wrapper.emitted('change')).toEqual([[8]])
  })

  it('步进按钮键盘可达：不改写 tabindex，聚焦后 Enter/Space 为平台原生激活路径', async () => {
    const wrapper = mount(InputNumber, {
      props: { modelValue: 5 },
      attachTo: document.body,
    })
    const increase = wrapper.find('button.ui-input-number__increase')
    expect(increase.attributes('tabindex')).toBeUndefined()
    ;(increase.element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(increase.element)
    await increase.trigger('keydown', { key: 'Enter' })
    // Enter 不会触发组件的步进逻辑（平台原生 click 激活才步进），键盘事件本身被放行
    expect(wrapper.emitted('step')).toBeUndefined()
    wrapper.unmount()
  })

  it('expose.focus() / expose.blur() 管理焦点（仅客户端有意义）', () => {
    const wrapper = mount(InputNumber, { attachTo: document.body })
    const exposed = wrapper.vm as InputNumberExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('input').element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('input').element)
    wrapper.unmount()
  })
})
