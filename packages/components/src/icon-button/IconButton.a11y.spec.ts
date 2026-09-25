// a11y spec：原生语义 / aria 属性 / 键盘 Enter·Space / 可访问名（dev warn）/ 焦点路径。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import IconButton from './IconButton.vue'
import { ICON_BUTTON_MISSING_LABEL_WARNING } from './IconButton.constants'
import type { IconButtonExpose } from './IconButton.types'

describe('IconButton a11y', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('原生 <button>（隐式 role=button），不额外书写 role', () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('不改写 tabindex：自然进入 Tab 序', () => {
    expect(mount(IconButton, { attrs: { 'aria-label': '关闭' } }).attributes('tabindex')).toBeUndefined()
  })

  it('可访问名：aria-label / aria-labelledby 落在根 button，读屏可得名称', () => {
    const labelled = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    expect(labelled.attributes('aria-label')).toBe('关闭')

    const by = mount(IconButton, {
      attrs: { 'aria-labelledby': 'close-hint' },
      slots: { default: () => h('svg', { viewBox: '0 0 24 24' }) },
    })
    expect(by.attributes('aria-labelledby')).toBe('close-hint')
  })

  it('aria-label 与 aria-labelledby 皆缺：开发环境 console.warn 提示（一次性契约提示）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(IconButton)
    expect(warn).toHaveBeenCalledWith(ICON_BUTTON_MISSING_LABEL_WARNING)
  })

  it('提供 aria-label 或 aria-labelledby 其一：不产生 warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    mount(IconButton, { attrs: { 'aria-labelledby': 'close-hint' } })
    expect(warn).not.toHaveBeenCalled()
  })

  it('disabled：原生 disabled 属性存在（原生即移出 Tab 序），不用 aria-disabled', () => {
    const wrapper = mount(IconButton, { props: { disabled: true }, attrs: { 'aria-label': '删除' } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
  })

  it('loading：aria-busy="true" 且不置 disabled（保持可聚焦、读屏可达）', () => {
    const wrapper = mount(IconButton, { props: { loading: true }, attrs: { 'aria-label': '保存' } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('非 loading：不出现 aria-busy 属性', () => {
    expect(mount(IconButton, { attrs: { 'aria-label': '保存' } }).attributes('aria-busy')).toBeUndefined()
  })

  it('键盘 Enter：触发且仅触发一次 click', async () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    await wrapper.find('button.ui-icon-button').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('键盘 Space（" "）：触发且仅触发一次 click', async () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    await wrapper.find('button.ui-icon-button').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('键盘激活时 preventDefault：拦截原生二次激活与 Space 滚动，且只触发一次 click', () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    const button = wrapper.find('button.ui-icon-button').element
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
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    await wrapper.find('button.ui-icon-button').trigger('keydown', { key: 'Tab' })
    await wrapper.find('button.ui-icon-button').trigger('keydown', { key: 'a' })
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('loading 中 Enter / Space：键盘路径同样被拦截', async () => {
    const wrapper = mount(IconButton, { props: { loading: true }, attrs: { 'aria-label': '保存' } })
    await wrapper.find('button.ui-icon-button').trigger('keydown', { key: 'Enter' })
    await wrapper.find('button.ui-icon-button').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('disabled 中 Enter / Space：键盘路径同样被拦截', async () => {
    const wrapper = mount(IconButton, { props: { disabled: true }, attrs: { 'aria-label': '删除' } })
    await wrapper.find('button.ui-icon-button').trigger('keydown', { key: 'Enter' })
    await wrapper.find('button.ui-icon-button').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('加载指示 svg 带 aria-hidden，不进入可读内容', () => {
    const wrapper = mount(IconButton, { props: { loading: true }, attrs: { 'aria-label': '保存' } })
    const spinner = wrapper.find('.ui-icon-button__spinner-svg')
    expect(spinner.exists()).toBe(true)
    expect(spinner.attributes('aria-hidden')).toBe('true')
  })

  it('focus-visible 路径：expose.focus() 可聚焦根按钮（document.activeElement）', () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' }, attachTo: document.body })
    const exposed = wrapper.vm as IconButtonExpose
    exposed.focus()
    expect(document.activeElement).toBe(wrapper.element)
    exposed.blur()
    expect(document.activeElement).not.toBe(wrapper.element)
    wrapper.unmount()
  })
})
