// api spec：props 默认值 / emits 声明 / slots 渲染 / attrs 透传（可访问名契约）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import IconButton from './IconButton.vue'

describe('IconButton api', () => {
  it('渲染原生 <button> 元素并携带 ui-icon-button 根类', () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toContain('ui-icon-button')
  })

  it('默认：variant=ghost、size=md、type=button、无 disabled/aria-busy', () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    expect(wrapper.classes()).toContain('ui-icon-button--ghost')
    expect(wrapper.classes()).toContain('ui-icon-button--md')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('variant / size 修饰类正确落位', () => {
    expect(
      mount(IconButton, { props: { variant: 'primary', size: 'lg' }, attrs: { 'aria-label': '保存' } }).classes(),
    ).toEqual(expect.arrayContaining(['ui-icon-button--primary', 'ui-icon-button--lg']))

    expect(
      mount(IconButton, { props: { variant: 'outline', size: 'sm' }, attrs: { 'aria-label': '编辑' } }).classes(),
    ).toEqual(expect.arrayContaining(['ui-icon-button--outline', 'ui-icon-button--sm']))
  })

  it('可访问名契约：aria-label / aria-labelledby 经 attrs 透传到根 button（不声明为 props）', () => {
    const labelled = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    expect(labelled.attributes('aria-label')).toBe('关闭')

    const by = mount(IconButton, { attrs: { 'aria-labelledby': 'close-hint' } })
    expect(by.attributes('aria-labelledby')).toBe('close-hint')
    expect(by.attributes('aria-label')).toBeUndefined()
  })

  it('默认插槽渲染内联 SVG 到 __icon 容器', () => {
    const wrapper = mount(IconButton, {
      attrs: { 'aria-label': '关闭' },
      slots: { default: () => h('svg', { viewBox: '0 0 24 24' }) },
    })
    expect(wrapper.find('.ui-icon-button__icon').exists()).toBe(true)
    expect(wrapper.find('.ui-icon-button__icon svg').exists()).toBe(true)
  })

  it('loading=true：渲染 spinner 且默认插槽让位', () => {
    const wrapper = mount(IconButton, {
      props: { loading: true },
      attrs: { 'aria-label': '保存' },
      slots: { default: () => h('svg', { viewBox: '0 0 24 24' }) },
    })
    expect(wrapper.find('.ui-icon-button__spinner').exists()).toBe(true)
    expect(wrapper.find('.ui-icon-button__spinner-svg').exists()).toBe(true)
    expect(wrapper.find('.ui-icon-button__icon').exists()).toBe(false)
    expect(wrapper.classes()).toContain('ui-icon-button--loading')
  })

  it('disabled=true：原生 disabled 属性存在', () => {
    const wrapper = mount(IconButton, { props: { disabled: true }, attrs: { 'aria-label': '删除' } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('click 已声明：点击时携带原生 MouseEvent 载荷发出', async () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
  })
})
