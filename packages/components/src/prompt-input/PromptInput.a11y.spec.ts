// a11y spec：原生语义（隐式 role=textbox）/ 键盘路径（Enter/Shift+Enter/IME）/ 发送-停止按钮可达性 / attrs 接入点。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PromptInput from './PromptInput.vue'
import type { PromptInputExpose } from './PromptInput.types'

describe('PromptInput a11y', () => {
  it('原生 <textarea>（隐式 role=textbox、隐式多行），不书写显式 role/tabindex 覆盖', () => {
    const control = mount(PromptInput).find('textarea')
    expect(control.element.tagName).toBe('TEXTAREA')
    expect(control.attributes('role')).toBeUndefined()
    expect(control.attributes('tabindex')).toBeUndefined()
  })

  it('键盘路径：可提交时 Enter 发送并 preventDefault（焦点在输入区内触发）', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '你好' }, attachTo: document.body })
    const el = wrapper.find('textarea').element
    el.focus()
    expect(document.activeElement).toBe(el)

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    el.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(true)
    expect(wrapper.emitted('submit')).toEqual([['你好']])
    wrapper.unmount()
  })

  it('键盘路径：Shift+Enter 换行不被拦截（defaultPrevented=false，原生换行保留）', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '第一行' }, attachTo: document.body })
    const el = wrapper.find('textarea').element
    el.focus()
    const shiftEnter = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true })
    el.dispatchEvent(shiftEnter)
    expect(shiftEnter.defaultPrevented).toBe(false)
    expect(wrapper.emitted('submit')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘路径：IME 组合中 Enter 不发送不拦截（读屏/输入法候选确认不受影响）', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: 'pinyin' }, attachTo: document.body })
    const el = wrapper.find('textarea').element
    el.focus()
    el.dispatchEvent(new Event('compositionstart'))
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    el.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    expect(wrapper.emitted('submit')).toBeUndefined()
    el.dispatchEvent(new Event('compositionend'))
    const committed = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    el.dispatchEvent(committed)
    expect(committed.defaultPrevented).toBe(true)
    expect(wrapper.emitted('submit')).toEqual([['pinyin']])
    wrapper.unmount()
  })

  it('内建发送按钮为原生 button（type=button，键盘可原生激活），图标为 aria-hidden 装饰', () => {
    const button = mount(PromptInput, { props: { modelValue: 'x' } }).find('button.ui-prompt-input__send')
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('发送')
    expect(button.attributes('aria-hidden')).toBeUndefined()
    const icon = button.find('svg')
    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(icon.attributes('focusable')).toBe('false')
  })

  it('aria-label 随 loading 在 发送/停止 间切换；加载中停止按钮保持键盘可达（不 disabled）', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '生成中' } })
    expect(wrapper.find('button.ui-prompt-input__send').attributes('aria-label')).toBe('发送')
    await wrapper.setProps({ loading: true })
    const button = wrapper.find('button.ui-prompt-input__send')
    expect(button.attributes('aria-label')).toBe('停止')
    expect(button.attributes('disabled')).toBeUndefined()
    await button.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('expose.focus()/blur()：焦点落原生 textarea，可继续键入提交', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '聚焦后发送' }, attachTo: document.body })
    const exposed = wrapper.vm as PromptInputExpose
    exposed.focus()
    const el = wrapper.find('textarea').element
    expect(document.activeElement).toBe(el)
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    el.dispatchEvent(enter)
    expect(wrapper.emitted('submit')).toEqual([['聚焦后发送']])
    exposed.blur()
    expect(document.activeElement).not.toBe(el)
    wrapper.unmount()
  })

  it('disabled：原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const wrapper = mount(PromptInput, { props: { disabled: true } })
    const control = wrapper.find('textarea')
    expect(control.attributes('disabled')).toBeDefined()
    expect(control.attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.find('button.ui-prompt-input__send').attributes('disabled')).toBeDefined()
  })

  it('aria-describedby 经 attrs 落在原生 textarea（提示/错误文案接入点）', () => {
    const control = mount(PromptInput, { attrs: { 'aria-describedby': 'prompt-shortcut' } }).find('textarea')
    expect(control.attributes('aria-describedby')).toBe('prompt-shortcut')
  })

  it('placeholder 不承担 label 职责：组件自身不设置 aria-label', () => {
    const control = mount(PromptInput, { props: { placeholder: '给 AI 的提示词' } }).find('textarea')
    expect(control.attributes('placeholder')).toBe('给 AI 的提示词')
    expect(control.attributes('aria-label')).toBeUndefined()
  })
})
