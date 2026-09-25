// a11y spec：radiogroup 语义 / 原生 radio 键盘路径 / label 关联 / 焦点管理。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Radio from './Radio.vue'
import RadioGroup from './RadioGroup.vue'
import type { RadioExpose, RadioValue } from './Radio.types'

function mountGroup(
  radios: Array<{ value: RadioValue; label?: string; disabled?: boolean }>,
  groupProps: Record<string, unknown> = {},
) {
  return mount(RadioGroup, {
    props: { name: 'plan', ...groupProps },
    slots: { default: () => radios.map((r) => h(Radio, { key: r.value, ...r })) },
    attachTo: document.body,
  })
}

describe('Radio a11y', () => {
  it('组容器 role="radiogroup"，attrs 的 aria-label 落容器', () => {
    const wrapper = mountGroup([{ value: 'a', label: '甲' }], { 'aria-label': '套餐' })
    expect(wrapper.attributes('role')).toBe('radiogroup')
    expect(wrapper.attributes('aria-label')).toBe('套餐')
  })

  it('原生 <input type="radio">：无 role / aria-checked / tabindex（checked 语义原生表达）', () => {
    const control = mount(Radio, { props: { value: 'a' } }).find('input')
    expect(control.attributes('role')).toBeUndefined()
    expect(control.attributes('aria-checked')).toBeUndefined()
    expect(control.attributes('tabindex')).toBeUndefined()
  })

  it('组内 radio 共享组 name（原生互斥与方向键导航的分组依据）', () => {
    const wrapper = mountGroup([{ value: 'a' }, { value: 'b' }])
    for (const input of wrapper.findAll('input')) {
      expect(input.attributes('name')).toBe('plan')
    }
  })

  it('键盘方向键 / Space 均为原生路径：keydown 不被组件拦截（defaultPrevented=false）', () => {
    const wrapper = mountGroup([{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }])
    const control = wrapper.findAll('input')[1]!.element as HTMLInputElement
    control.focus()
    expect(document.activeElement).toBe(control)

    for (const key of ['ArrowRight', 'ArrowDown', 'ArrowUp', 'ArrowLeft', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      control.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    wrapper.unmount()
  })

  it('根为 label 元素关联原生控件：点击文本即选中（无 id/for 依赖）', () => {
    const wrapper = mount(Radio, { props: { value: 'a', label: '甲' } })
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.find('input').element.closest('label')).toBe(wrapper.element)
  })

  it('disabled：原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const control = mount(Radio, { props: { value: 'a', disabled: true } }).find('input')
    expect(control.attributes('disabled')).toBeDefined()
    expect(control.attributes('aria-disabled')).toBeUndefined()
  })

  it('选中圆点为纯装饰（aria-hidden），不进入可读内容', () => {
    const wrapper = mount(Radio, { props: { value: 'a', label: '甲' } })
    expect(wrapper.find('.ui-radio__dot').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('甲')
  })

  it('expose.focus()/blur() 落在原生 radio 上（键盘用户入口）', () => {
    const wrapper = mount(Radio, { props: { value: 'a' }, attachTo: document.body })
    const exposed = wrapper.vm as unknown as RadioExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('input').element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('input').element)
    wrapper.unmount()
  })

  it('键盘选中路径：聚焦后原生 change 以该 Radio 的 value 发出（经组转发）', async () => {
    const wrapper = mount(RadioGroup, {
      props: { name: 'plan' },
      slots: { default: () => [h(Radio, { key: 'a', value: 'a', label: '甲' })] },
      attachTo: document.body,
    })
    const control = wrapper.find('input')
    ;(control.element as HTMLInputElement).focus()
    expect(document.activeElement).toBe(control.element)
    await control.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['a']])
    wrapper.unmount()
  })
})
