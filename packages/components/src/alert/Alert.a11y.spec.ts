// a11y spec：live region 角色（status/alert）/ 关闭按钮 aria 与键盘可达 / 图标不进入可读内容。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Alert from './Alert.vue'
import { ALERT_CLOSE_ARIA_LABEL } from './Alert.constants'

describe('Alert a11y', () => {
  it('info / success / warning：role="status"（polite 播报）', () => {
    for (const severity of ['info', 'success', 'warning'] as const) {
      const wrapper = mount(Alert, { props: { severity, title: '提示' } })
      expect(wrapper.attributes('role')).toBe('status')
    }
  })

  it('danger：role="alert"（读屏立即播报）', () => {
    const wrapper = mount(Alert, { props: { severity: 'danger', title: '失败' } })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('标题与正文为根内可读文本', () => {
    const wrapper = mount(Alert, {
      props: { title: '保存失败' },
      slots: { default: () => '请检查网络后重试。' },
    })
    expect(wrapper.text()).toContain('保存失败')
    expect(wrapper.text()).toContain('请检查网络后重试。')
  })

  it('根容器不进入 Tab 序（live region 不抢焦点）', () => {
    const wrapper = mount(Alert, { props: { title: '被动通知' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('关闭按钮：原生 <button type="button">、aria-label="关闭"、自然进入 Tab 序', () => {
    const wrapper = mount(Alert, { props: { closable: true } })
    const close = wrapper.find('button.ui-alert__close')
    expect(close.element.tagName).toBe('BUTTON')
    expect(close.attributes('type')).toBe('button')
    expect(close.attributes('aria-label')).toBe(ALERT_CLOSE_ARIA_LABEL)
    expect(ALERT_CLOSE_ARIA_LABEL).toBe('关闭')
    expect(close.attributes('tabindex')).toBeUndefined()
  })

  it('关闭按钮键盘路径未被阻止：Enter / Space keydown 不被 preventDefault（原生激活保持可用）', () => {
    const wrapper = mount(Alert, { props: { closable: true } })
    const close = wrapper.find('button.ui-alert__close').element
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    close.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    close.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false)
  })

  it('关闭按钮 aria-label 不随 severity 改变（动作语义恒定）', () => {
    for (const severity of ['info', 'danger'] as const) {
      const wrapper = mount(Alert, { props: { severity, closable: true } })
      expect(wrapper.find('button.ui-alert__close').attributes('aria-label')).toBe('关闭')
    }
  })

  it('内建图标 svg aria-hidden="true"，不进入可读内容', () => {
    const wrapper = mount(Alert, { props: { title: '图标隐藏' } })
    const svg = wrapper.find('.ui-alert__icon-svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('aria-hidden')).toBe('true')
  })

  it('关闭按钮 X 图标 svg aria-hidden="true"', () => {
    const wrapper = mount(Alert, { props: { closable: true } })
    expect(wrapper.find('.ui-alert__close-svg').attributes('aria-hidden')).toBe('true')
  })

  it('使用方经 #icon 插槽替换图标：组件不添加可读文案（装饰性由使用方 svg 自行 aria-hidden）', () => {
    const wrapper = mount(Alert, {
      slots: { icon: () => h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }) },
    })
    expect(wrapper.find('.ui-alert__icon-svg').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })
})
