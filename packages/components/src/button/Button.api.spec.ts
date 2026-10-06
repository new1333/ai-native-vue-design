// api spec：props 默认值 / emits 声明 / slots 渲染（ButtonGroup 的用例见 ButtonGroup.*.spec.ts）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Button from './Button.vue'
import ButtonRoot from './ButtonRoot.vue'

describe('Button api', () => {
  it('渲染原生 <button> 元素并携带 ui-button 根类', () => {
    const wrapper = mount(Button)
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toContain('ui-button')
  })

  it('默认：variant=secondary、size=md、type=button、无 disabled/aria-busy', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).toContain('ui-button--secondary')
    expect(wrapper.classes()).toContain('ui-button--md')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('variant / size / block 修饰类正确落位', () => {
    const wrapper = mount(Button, {
      props: { variant: 'danger', size: 'lg', block: true },
    })
    expect(wrapper.classes()).toContain('ui-button--danger')
    expect(wrapper.classes()).toContain('ui-button--lg')
    expect(wrapper.classes()).toContain('ui-button--block')
  })

  it('原生 type 可透传为 submit / reset', () => {
    expect(mount(Button, { props: { type: 'submit' } }).attributes('type')).toBe('submit')
    expect(mount(Button, { props: { type: 'reset' } }).attributes('type')).toBe('reset')
  })

  it('默认插槽渲染文本 label', () => {
    const wrapper = mount(Button, { slots: { default: () => '保存' } })
    expect(wrapper.find('.ui-button__label').text()).toBe('保存')
  })

  it('icon / iconRight 插槽渲染到专属容器', () => {
    const wrapper = mount(Button, {
      slots: {
        default: () => '开始',
        icon: () => h('svg', { viewBox: '0 0 24 24' }),
        iconRight: () => h('svg', { viewBox: '0 0 24 24' }),
      },
    })
    const icons = wrapper.findAll('.ui-button__icon')
    expect(icons).toHaveLength(2)
    expect(icons[0].classes()).not.toContain('ui-button__icon--right')
    expect(icons[1].classes()).toContain('ui-button__icon--right')
    expect(icons[0].find('svg').exists()).toBe(true)
  })

  it('loading=true：渲染 spinner 且 icon 插槽让位', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { icon: () => h('svg', { viewBox: '0 0 24 24' }) },
    })
    expect(wrapper.find('.ui-button__spinner').exists()).toBe(true)
    expect(wrapper.find('.ui-button__icon').exists()).toBe(false)
    expect(wrapper.classes()).toContain('ui-button--loading')
  })

  it('disabled=true：原生 disabled 属性存在', () => {
    expect(mount(Button, { props: { disabled: true } }).attributes('disabled')).toBeDefined()
  })

  it('click 已声明：点击时携带原生 MouseEvent 载荷发出', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
  })

  it('ButtonRoot 为无样式交互根：原生 button、无 ui- 视觉类、透传 attrs', () => {
    const wrapper = mount(ButtonRoot, { attrs: { id: 'root-btn', 'aria-label': '根按钮' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('id')).toBe('root-btn')
    expect(wrapper.attributes('aria-label')).toBe('根按钮')
    expect(wrapper.classes()).toEqual([])
  })
})
