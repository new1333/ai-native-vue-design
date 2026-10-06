// a11y spec：原生语义 / aria 属性 / 键盘 Enter·Space / 焦点路径（ButtonGroup 的用例见 ButtonGroup.*.spec.ts）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'
import type { ButtonExpose } from './Button.types'

describe('Button a11y', () => {
  it('原生 <button>（隐式 role=button），不额外书写 role', () => {
    const wrapper = mount(Button, { slots: { default: () => '保存' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('不改写 tabindex：自然进入 Tab 序', () => {
    expect(mount(Button).attributes('tabindex')).toBeUndefined()
  })

  it('disabled：原生 disabled 属性存在（原生即移出 Tab 序）', () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
  })

  it('loading：aria-busy="true" 且不置 disabled（保持可聚焦、读屏可达）', () => {
    const wrapper = mount(Button, { props: { loading: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('非 loading：不出现 aria-busy 属性', () => {
    expect(mount(Button).attributes('aria-busy')).toBeUndefined()
  })

  it('键盘 Enter：触发且仅触发一次 click', async () => {
    const wrapper = mount(Button)
    await wrapper.find('button.ui-button').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('键盘 Space（" "）：触发且仅触发一次 click', async () => {
    const wrapper = mount(Button)
    await wrapper.find('button.ui-button').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('键盘激活时 preventDefault：拦截原生二次激活与 Space 滚动，且只触发一次 click', () => {
    const wrapper = mount(Button)
    const button = wrapper.find('button.ui-button').element
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    button.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(true)
    expect(wrapper.emitted('click')).toHaveLength(1)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    button.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    expect(wrapper.emitted('click')).toHaveLength(2)
  })

  it('非激活键（如 Tab、A）不触发 click', async () => {
    const wrapper = mount(Button)
    await wrapper.find('button.ui-button').trigger('keydown', { key: 'Tab' })
    await wrapper.find('button.ui-button').trigger('keydown', { key: 'a' })
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('loading 中 Enter / Space：键盘路径同样被拦截', async () => {
    const wrapper = mount(Button, { props: { loading: true } })
    await wrapper.find('button.ui-button').trigger('keydown', { key: 'Enter' })
    await wrapper.find('button.ui-button').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('disabled 中 Enter / Space：键盘路径同样被拦截', async () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    await wrapper.find('button.ui-button').trigger('keydown', { key: 'Enter' })
    await wrapper.find('button.ui-button').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('加载指示 svg 带 aria-hidden，不进入可读内容', () => {
    const wrapper = mount(Button, { props: { loading: true } })
    const spinner = wrapper.find('.ui-button__spinner-svg')
    expect(spinner.exists()).toBe(true)
    expect(spinner.attributes('aria-hidden')).toBe('true')
  })

  it('focus-visible 路径：expose.focus() 可聚焦根按钮（document.activeElement）', () => {
    const wrapper = mount(Button, { attachTo: document.body })
    const exposed = wrapper.vm as ButtonExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.element)
    wrapper.unmount()
  })
})
