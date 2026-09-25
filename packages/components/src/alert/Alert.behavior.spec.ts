// behavior spec：close 交互 / 显隐契约 / severity 与内容切换的响应式行为。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from './Alert.vue'

describe('Alert behavior', () => {
  it('点击关闭按钮触发 close，且仅触发一次', async () => {
    const wrapper = mount(Alert, { props: { closable: true, title: '可关闭' } })
    await wrapper.find('button.ui-alert__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('非 closable：不渲染关闭按钮，无 close 路径', () => {
    const wrapper = mount(Alert)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('close 后组件不自行隐藏（显隐归使用方），可继续触发 close', async () => {
    const wrapper = mount(Alert, { props: { closable: true } })
    await wrapper.find('button.ui-alert__close').trigger('click')
    expect(wrapper.find('.ui-alert').exists()).toBe(true)
    await wrapper.find('button.ui-alert__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('closable 响应式切换：关闭按钮随之渲染/移除', async () => {
    const wrapper = mount(Alert, { props: { closable: false } })
    expect(wrapper.find('button.ui-alert__close').exists()).toBe(false)
    await wrapper.setProps({ closable: true })
    expect(wrapper.find('button.ui-alert__close').exists()).toBe(true)
    await wrapper.setProps({ closable: false })
    expect(wrapper.find('button.ui-alert__close').exists()).toBe(false)
  })

  it('severity 切换：修饰类、role 与内建图标同步更新', async () => {
    const wrapper = mount(Alert, { props: { severity: 'info' } })
    expect(wrapper.classes()).toContain('ui-alert--info')
    expect(wrapper.attributes('role')).toBe('status')
    await wrapper.setProps({ severity: 'danger' })
    expect(wrapper.classes()).toContain('ui-alert--danger')
    expect(wrapper.attributes('role')).toBe('alert')
    // 内建图标随 severity 换 path（X 圆形为两条斜线路径）
    const paths = wrapper.findAll('.ui-alert__icon-svg path')
    expect(paths.length).toBe(3)
  })

  it('title 与正文响应式更新：无 → 有 → 无', async () => {
    const wrapper = mount(Alert, { slots: { default: () => '正文' } })
    expect(wrapper.find('.ui-alert__title').exists()).toBe(false)
    await wrapper.setProps({ title: '新标题' })
    expect(wrapper.find('.ui-alert__title').text()).toBe('新标题')
    expect(wrapper.find('.ui-alert__title + .ui-alert__body').exists()).toBe(true)
    await wrapper.setProps({ title: undefined })
    expect(wrapper.find('.ui-alert__title').exists()).toBe(false)
  })

  it('无标题时正文直接作为唯一内容行（无附加间距元素）', () => {
    const wrapper = mount(Alert, { slots: { default: () => '只有正文' } })
    expect(wrapper.find('.ui-alert__title').exists()).toBe(false)
    expect(wrapper.find('.ui-alert__body').text()).toBe('只有正文')
  })
})
