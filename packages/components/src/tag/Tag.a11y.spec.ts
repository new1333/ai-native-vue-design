// a11y spec：主体纯文本语义不可聚焦 / 关闭按钮 aria 与键盘可达 / disabled 双通道 / 图标纯装饰。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Tag from './Tag.vue'
import { TAG_CLOSE_ARIA_LABEL } from './Tag.constants'

describe('Tag a11y', () => {
  it('主体纯文本语义：不加 role，分类/属性由文本承载', () => {
    const wrapper = mount(Tag, { props: { variant: 'success' }, slots: { default: () => '已认证' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.text()).toBe('已认证')
  })

  it('主体不可聚焦：无 tabindex，非交互元素不进入 Tab 序', () => {
    const wrapper = mount(Tag, { slots: { default: () => '前端' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('关闭按钮：原生 <button type="button">、aria-label="关闭"、自然进入 Tab 序', () => {
    const wrapper = mount(Tag, { props: { closable: true } })
    const close = wrapper.find('button.ui-tag__close')
    expect(close.element.tagName).toBe('BUTTON')
    expect(close.attributes('type')).toBe('button')
    expect(close.attributes('aria-label')).toBe(TAG_CLOSE_ARIA_LABEL)
    expect(TAG_CLOSE_ARIA_LABEL).toBe('关闭')
    expect(close.attributes('tabindex')).toBeUndefined()
  })

  it('关闭按钮键盘路径未被阻止：Enter / Space keydown 不被 preventDefault（原生激活保持可用）', () => {
    const wrapper = mount(Tag, { props: { closable: true } })
    const close = wrapper.find('button.ui-tag__close').element
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    close.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    close.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false)
  })

  it('关闭按钮 X 图标 svg aria-hidden="true"，不进入可读内容', () => {
    const wrapper = mount(Tag, { props: { closable: true } })
    expect(wrapper.find('.ui-tag__close-svg').attributes('aria-hidden')).toBe('true')
  })

  it('disabled：根元素 aria-disabled="true" 且关闭按钮原生 disabled（双通道禁用）', () => {
    const wrapper = mount(Tag, { props: { closable: true, disabled: true } })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.find('button.ui-tag__close').attributes('disabled')).toBeDefined()
  })

  it('非 disabled：aria-disabled 不出现（不产生冗余播报）', () => {
    const wrapper = mount(Tag, { props: { closable: true, disabled: false } })
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
  })

  it('icon 插槽为使用方内容：组件不添加可读文案、不加 role（装饰性由使用方 svg 自行 aria-hidden）', () => {
    const wrapper = mount(Tag, {
      slots: {
        icon: () => h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }),
        default: () => '前端',
      },
    })
    const icon = wrapper.find('.ui-tag__icon')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes('role')).toBeUndefined()
    expect(wrapper.text()).toBe('前端')
  })
})
