// behavior spec：click / loading / disabled 的交互行为（复用 ButtonRoot 的激活网关）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import IconButton from './IconButton.vue'

describe('IconButton behavior', () => {
  it('点击触发 click 事件，载荷为原生 MouseEvent', async () => {
    const wrapper = mount(IconButton, { attrs: { 'aria-label': '关闭' } })
    await wrapper.find('button.ui-icon-button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
  })

  it('loading=true：点击不触发 click', async () => {
    const wrapper = mount(IconButton, { props: { loading: true }, attrs: { 'aria-label': '保存' } })
    await wrapper.find('button.ui-icon-button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('loading=true：即使未置原生 disabled，直接派发的合成激活仍被拦截', () => {
    const wrapper = mount(IconButton, { props: { loading: true }, attrs: { 'aria-label': '保存' } })
    expect(wrapper.attributes('disabled')).toBeUndefined()
    void (wrapper.find('button.ui-icon-button').element as HTMLButtonElement).click()
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('disabled=true：原生 disabled 存在且点击不触发 click', async () => {
    const wrapper = mount(IconButton, { props: { disabled: true }, attrs: { 'aria-label': '删除' } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.find('button.ui-icon-button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('disabled → 启用后 click 恢复触发（响应式语义）', async () => {
    const wrapper = mount(IconButton, { props: { disabled: true }, attrs: { 'aria-label': '编辑' } })
    await wrapper.setProps({ disabled: false })
    await wrapper.find('button.ui-icon-button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('loading 切换：图标与加载指示显隐随之切换', async () => {
    const wrapper = mount(IconButton, {
      attrs: { 'aria-label': '刷新' },
      slots: { default: () => h('svg', { viewBox: '0 0 24 24' }) },
    })
    expect(wrapper.find('.ui-icon-button__icon').exists()).toBe(true)
    expect(wrapper.find('.ui-icon-button__spinner').exists()).toBe(false)
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('.ui-icon-button__icon').exists()).toBe(false)
    expect(wrapper.find('.ui-icon-button__spinner').exists()).toBe(true)
    await wrapper.setProps({ loading: false })
    expect(wrapper.find('.ui-icon-button__icon').exists()).toBe(true)
    expect(wrapper.find('.ui-icon-button__spinner').exists()).toBe(false)
  })
})
