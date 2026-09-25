// a11y spec：role=switch / aria-checked / aria-busy / 原生键盘路径 / 焦点管理。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Switch from './Switch.vue'
import type { SwitchExpose } from './Switch.types'

describe('Switch a11y', () => {
  it('role="switch" 恒定存在（原生 button 不被识别为普通按钮语义）', () => {
    expect(mount(Switch).find('button').attributes('role')).toBe('switch')
  })

  it('aria-checked 常驻：true/false 随受控值（role=switch 必需属性不缺省）', async () => {
    const wrapper = mount(Switch)
    expect(wrapper.find('button').attributes('aria-checked')).toBe('false')
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.find('button').attributes('aria-checked')).toBe('true')
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.find('button').attributes('aria-checked')).toBe('false')
  })

  it('loading：aria-busy="true" 且不落 disabled（读屏可感知、保持可聚焦）', () => {
    const wrapper = mount(Switch, { props: { loading: true } })
    expect(wrapper.find('button').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('非 loading 不出现 aria-busy；loading 旋转指示 svg aria-hidden 不进可读内容', () => {
    expect(mount(Switch).find('button').attributes('aria-busy')).toBeUndefined()

    const loading = mount(Switch, { props: { loading: true } })
    expect(loading.find('.ui-switch__spinner').attributes('aria-hidden')).toBe('true')
  })

  it('键盘 Enter/Space 为原生 button 激活路径：keydown 不被组件拦截（defaultPrevented=false）', () => {
    const wrapper = mount(Switch, { attachTo: document.body })
    const control = wrapper.find('button').element as HTMLButtonElement
    control.focus()
    expect(document.activeElement).toBe(control)

    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      control.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    wrapper.unmount()
  })

  it('不改写 tabindex；loading 中仍可聚焦（focus 落在原生 button）', () => {
    const wrapper = mount(Switch, { props: { loading: true }, attachTo: document.body })
    expect(wrapper.find('button').attributes('tabindex')).toBeUndefined()
    ;(wrapper.find('button').element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(wrapper.find('button').element)
    wrapper.unmount()
  })

  it('disabled：原生 disabled（移出 Tab 序），不使用 aria-disabled', () => {
    const control = mount(Switch, { props: { disabled: true } }).find('button')
    expect(control.attributes('disabled')).toBeDefined()
    expect(control.attributes('aria-disabled')).toBeUndefined()
  })

  it('根为 label 元素关联原生 button：点击文本即切换（无 id/for 依赖）', () => {
    const wrapper = mount(Switch, { props: { label: '通知' } })
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.find('button').element.closest('label')).toBe(wrapper.element)
    expect(wrapper.text()).toContain('通知')
  })

  it('无 label prop/插槽：attrs 的 aria-label 直达原生 button（可读名称仍成立）', () => {
    const control = mount(Switch, { attrs: { 'aria-label': '静音' } }).find('button')
    expect(control.attributes('aria-label')).toBe('静音')
  })

  it('expose.focus()/blur() 落在原生 button 上', () => {
    const wrapper = mount(Switch, { attachTo: document.body })
    const exposed = wrapper.vm as unknown as SwitchExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.find('button').element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.find('button').element)
    wrapper.unmount()
  })
})
