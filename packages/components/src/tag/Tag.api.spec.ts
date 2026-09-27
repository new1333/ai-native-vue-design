// api spec：props 默认值 / variant 档位 / closable / disabled / slots 渲染 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Tag from './Tag.vue'
import { TAG_CLOSE_ARIA_LABEL } from './Tag.constants'

describe('Tag api', () => {
  it('渲染 <span> 并携带 ui-tag 根类', () => {
    const wrapper = mount(Tag, { slots: { default: () => '前端' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('ui-tag')
    expect(wrapper.text()).toBe('前端')
  })

  it('默认：variant=neutral、非 closable（无关闭按钮）、非 disabled', () => {
    const wrapper = mount(Tag)
    expect(wrapper.classes()).toContain('ui-tag--neutral')
    expect(wrapper.find('button.ui-tag__close').exists()).toBe(false)
    expect(wrapper.classes()).not.toContain('ui-tag--disabled')
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
  })

  it('variant 全档位映射修饰类（neutral/success/warning/danger/info）', () => {
    const variants = ['neutral', 'success', 'warning', 'danger', 'info'] as const
    for (const variant of variants) {
      expect(mount(Tag, { props: { variant } }).classes()).toContain(`ui-tag--${variant}`)
    }
  })

  it('closable=true：渲染原生关闭按钮（type=button、aria-label="关闭"）', () => {
    const wrapper = mount(Tag, { props: { closable: true }, slots: { default: () => 'VIP' } })
    const close = wrapper.find('button.ui-tag__close')
    expect(close.exists()).toBe(true)
    expect(close.attributes('type')).toBe('button')
    expect(close.attributes('aria-label')).toBe(TAG_CLOSE_ARIA_LABEL)
    expect(wrapper.text()).toContain('VIP')
  })

  it('disabled=true：关闭按钮置 disabled、根元素带禁用修饰类与 aria-disabled', () => {
    const wrapper = mount(Tag, { props: { closable: true, disabled: true } })
    expect(wrapper.classes()).toContain('ui-tag--disabled')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.find('button.ui-tag__close').attributes('disabled')).toBeDefined()
  })

  it('icon 插槽：渲染前置图标位容器；缺省时不渲染', () => {
    const withIcon = mount(Tag, { slots: { icon: () => h('svg') } })
    expect(withIcon.find('.ui-tag__icon').exists()).toBe(true)
    expect(withIcon.find('.ui-tag__icon svg').exists()).toBe(true)

    const withoutIcon = mount(Tag, { slots: { default: () => '无图标' } })
    expect(withoutIcon.find('.ui-tag__icon').exists()).toBe(false)
  })

  it('attrs 透传到根元素（data-testid）', () => {
    const wrapper = mount(Tag, { attrs: { 'data-testid': 'dept-tag' } })
    expect(wrapper.attributes('data-testid')).toBe('dept-tag')
  })
})
