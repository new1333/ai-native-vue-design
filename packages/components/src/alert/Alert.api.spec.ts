// api spec：props 默认值 / severity 档位 / slots 渲染 / emits 声明。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Alert from './Alert.vue'
import { ALERT_CLOSE_ARIA_LABEL, ALERT_SEVERITIES } from './Alert.constants'

describe('Alert api', () => {
  it('渲染 div 容器并携带 ui-alert 根类', () => {
    const wrapper = mount(Alert)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-alert')
  })

  it('默认：severity=info（info 修饰类），无标题/正文/关闭按钮', () => {
    const wrapper = mount(Alert)
    expect(wrapper.classes()).toContain('ui-alert--info')
    expect(wrapper.find('.ui-alert__title').exists()).toBe(false)
    expect(wrapper.find('.ui-alert__body').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('四档 severity 对应修饰类与 role 推导', () => {
    const expectedRoles: Record<(typeof ALERT_SEVERITIES)[number], string> = {
      info: 'status',
      success: 'status',
      warning: 'status',
      danger: 'alert',
    }
    for (const severity of ALERT_SEVERITIES) {
      const wrapper = mount(Alert, { props: { severity } })
      expect(wrapper.classes()).toContain(`ui-alert--${severity}`)
      expect(wrapper.attributes('role')).toBe(expectedRoles[severity])
    }
  })

  it('title 渲染进专属容器', () => {
    const wrapper = mount(Alert, { props: { title: '已保存' } })
    expect(wrapper.find('.ui-alert__title').text()).toBe('已保存')
  })

  it('默认插槽渲染正文', () => {
    const wrapper = mount(Alert, { slots: { default: () => '变更已同步。' } })
    expect(wrapper.find('.ui-alert__body').text()).toBe('变更已同步。')
  })

  it('icon 插槽覆盖内建图标：专属容器内渲染自定义 svg，内建 svg 不出现', () => {
    const wrapper = mount(Alert, {
      slots: { icon: () => h('svg', { viewBox: '0 0 24 24', class: 'custom-icon' }) },
    })
    const iconArea = wrapper.find('.ui-alert__icon')
    expect(iconArea.find('svg.custom-icon').exists()).toBe(true)
    expect(iconArea.find('.ui-alert__icon-svg').exists()).toBe(false)
  })

  it('未提供 icon 插槽时渲染内建语义图标 svg', () => {
    const wrapper = mount(Alert)
    expect(wrapper.find('.ui-alert__icon .ui-alert__icon-svg').exists()).toBe(true)
  })

  it('closable=true：渲染原生关闭按钮并带 aria-label', () => {
    const wrapper = mount(Alert, { props: { closable: true } })
    const close = wrapper.find('button.ui-alert__close')
    expect(close.exists()).toBe(true)
    expect(close.attributes('type')).toBe('button')
    expect(close.attributes('aria-label')).toBe(ALERT_CLOSE_ARIA_LABEL)
    expect(ALERT_CLOSE_ARIA_LABEL).toBe('关闭')
  })

  it('close 已声明：点击关闭按钮时以无载荷事件发出', async () => {
    const wrapper = mount(Alert, { props: { closable: true } })
    await wrapper.find('button.ui-alert__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('close')?.[0]).toEqual([])
  })
})
