// behavior spec：click / loading / disabled / block 的交互行为（ButtonGroup 的用例见 ButtonGroup.*.spec.ts）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Button from './Button.vue'

describe('Button behavior', () => {
  it('点击触发 click 事件，载荷为原生 MouseEvent', async () => {
    const wrapper = mount(Button, { slots: { default: () => '保存' } })
    await wrapper.find('button.ui-button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
  })

  it('loading=true：点击不触发 click（含直接派发的合成事件）', async () => {
    const wrapper = mount(Button, { props: { loading: true } })
    await wrapper.find('button.ui-button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('loading=true：即使未置原生 disabled，激活仍被拦截', () => {
    const wrapper = mount(Button, { props: { loading: true } })
    expect(wrapper.attributes('disabled')).toBeUndefined()
    void (wrapper.find('button.ui-button').element as HTMLButtonElement).click()
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('disabled=true：原生 disabled 存在且点击不触发 click', async () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.find('button.ui-button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('disabled → 启用后 click 恢复触发（响应式语义）', async () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    await wrapper.setProps({ disabled: false })
    await wrapper.find('button.ui-button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('block：切换 block 类（铺满容器）', async () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).not.toContain('ui-button--block')
    await wrapper.setProps({ block: true })
    expect(wrapper.classes()).toContain('ui-button--block')
  })

  it('loading 切换：spinner 与左图标显隐随之切换', async () => {
    const wrapper = mount(Button, {
      slots: {
        default: () => '分析',
        icon: () => h('svg', { viewBox: '0 0 24 24' }),
      },
    })
    expect(wrapper.find('.ui-button__icon').exists()).toBe(true)
    expect(wrapper.find('.ui-button__spinner').exists()).toBe(false)
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('.ui-button__icon').exists()).toBe(false)
    expect(wrapper.find('.ui-button__spinner').exists()).toBe(true)
    await wrapper.setProps({ loading: false })
    expect(wrapper.find('.ui-button__icon').exists()).toBe(true)
    expect(wrapper.find('.ui-button__spinner').exists()).toBe(false)
  })
})
