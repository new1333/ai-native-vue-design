// behavior spec：close 交互（含 disabled 阻断）/ 显隐契约 / variant 与 closable、disabled 的响应式切换。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Tag from './Tag.vue'

describe('Tag behavior', () => {
  it('点击关闭按钮触发 close，且仅触发一次', async () => {
    const wrapper = mount(Tag, { props: { closable: true }, slots: { default: () => 'VIP' } })
    await wrapper.find('button.ui-tag__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('非 closable：不渲染关闭按钮，无 close 路径', () => {
    const wrapper = mount(Tag, { slots: { default: () => '前端' } })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('close 后组件不自行移除（显隐归使用方），可继续触发 close', async () => {
    const wrapper = mount(Tag, { props: { closable: true } })
    await wrapper.find('button.ui-tag__close').trigger('click')
    expect(wrapper.find('.ui-tag').exists()).toBe(true)
    await wrapper.find('button.ui-tag__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('closable 响应式切换：关闭按钮随之渲染/移除', async () => {
    const wrapper = mount(Tag, { props: { closable: false } })
    expect(wrapper.find('button.ui-tag__close').exists()).toBe(false)
    await wrapper.setProps({ closable: true })
    expect(wrapper.find('button.ui-tag__close').exists()).toBe(true)
    await wrapper.setProps({ closable: false })
    expect(wrapper.find('button.ui-tag__close').exists()).toBe(false)
  })

  it('disabled=true：点击关闭按钮不触发 close', async () => {
    const wrapper = mount(Tag, { props: { closable: true, disabled: true } })
    const close = wrapper.find('button.ui-tag__close')
    expect(close.attributes('disabled')).toBeDefined()
    await close.trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('disabled 切换：aria-disabled、禁用修饰类与按钮 disabled 属性随之更新', async () => {
    const wrapper = mount(Tag, { props: { closable: true, disabled: false } })
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-tag--disabled')
    expect(wrapper.find('button.ui-tag__close').attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ disabled: true })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.classes()).toContain('ui-tag--disabled')
    expect(wrapper.find('button.ui-tag__close').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ disabled: false })
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-tag--disabled')
  })

  it('disabled 切换回 false 后 close 恢复可用', async () => {
    const wrapper = mount(Tag, { props: { closable: true, disabled: true } })
    await wrapper.setProps({ disabled: false })
    await wrapper.find('button.ui-tag__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('variant 切换：语义档修饰类随之更新', async () => {
    const wrapper = mount(Tag, { props: { variant: 'neutral' } })
    expect(wrapper.classes()).toContain('ui-tag--neutral')
    await wrapper.setProps({ variant: 'danger' })
    expect(wrapper.classes()).toContain('ui-tag--danger')
    expect(wrapper.classes()).not.toContain('ui-tag--neutral')
  })
})
