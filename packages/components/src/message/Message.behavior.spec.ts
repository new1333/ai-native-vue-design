// behavior spec：prop 驱动的角色/状态/流式切换与作用域插槽的响应式更新。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'
import Message from './Message.vue'
import type { MessageStatus } from './Message.types'

describe('Message behavior', () => {
  it('role 切换：user → assistant → system，修饰类随之切换', async () => {
    const wrapper = mount(Message, { props: { role: 'user' }, slots: { default: () => '正文' } })
    expect(wrapper.classes()).toContain('ui-message--user')
    await wrapper.setProps({ role: 'assistant' })
    expect(wrapper.classes()).toContain('ui-message--assistant')
    expect(wrapper.classes()).not.toContain('ui-message--user')
    await wrapper.setProps({ role: 'system' })
    expect(wrapper.classes()).toContain('ui-message--system')
    expect(wrapper.classes()).not.toContain('ui-message--assistant')
  })

  it('streaming 切换：光标节点与 aria-busy 同步出现/移除', async () => {
    const wrapper = mount(Message, { slots: { default: () => '内容' } })
    expect(wrapper.find('.ui-message__caret').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    await wrapper.setProps({ streaming: true })
    expect(wrapper.find('.ui-message__caret').exists()).toBe(true)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    await wrapper.setProps({ streaming: false })
    expect(wrapper.find('.ui-message__caret').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('status 切换：徽标文案随档位变化，error 挂根修饰类，清空后徽标移除', async () => {
    const wrapper = mount(Message, { props: { status: 'sending' } })
    expect(wrapper.find('.ui-message__status').text()).toContain('发送中')
    expect(wrapper.classes()).not.toContain('ui-message--status-error')

    await wrapper.setProps({ status: 'sent' })
    expect(wrapper.find('.ui-message__status').text()).toContain('已发送')

    await wrapper.setProps({ status: 'error' })
    expect(wrapper.find('.ui-message__status').text()).toContain('发送失败')
    expect(wrapper.classes()).toContain('ui-message--status-error')

    await wrapper.setProps({ status: undefined })
    expect(wrapper.find('.ui-message__status').exists()).toBe(false)
    expect(wrapper.classes()).not.toContain('ui-message--status-error')
  })

  it('name / timestamp 响应式更新', async () => {
    const wrapper = mount(Message, {
      props: { name: '旧名称', timestamp: '10:00' },
      slots: { default: () => '正文' },
    })
    expect(wrapper.find('.ui-message__name').text()).toBe('旧名称')
    expect(wrapper.find('.ui-message__time').text()).toBe('10:00')
    await wrapper.setProps({ name: '新名称', timestamp: '11:30' })
    expect(wrapper.find('.ui-message__name').text()).toBe('新名称')
    expect(wrapper.find('.ui-message__time').text()).toBe('11:30')
  })

  it('default 插槽作用域 message 随 props 响应式更新（流式内容消费场景）', async () => {
    const Host = defineComponent({
      props: {
        streaming: { type: Boolean, default: false },
        status: { type: String as PropType<MessageStatus | undefined>, default: undefined },
      },
      setup: (props) => () =>
        h(Message, { role: 'assistant', streaming: props.streaming, status: props.status }, {
          default: ({ message }: { message: { streaming: boolean; status?: string } }) =>
            h('span', { class: 'scope-live' }, `streaming:${message.streaming}|status:${message.status ?? '-'}`),
        }),
    })
    const wrapper = mount(Host)
    expect(wrapper.find('.scope-live').text()).toBe('streaming:false|status:-')
    await wrapper.setProps({ streaming: true, status: 'sending' })
    expect(wrapper.find('.scope-live').text()).toBe('streaming:true|status:sending')
  })

  it('avatar src 变化：<img> 的 src 同步更新', async () => {
    const wrapper = mount(Message, { props: { avatar: '/a.png', name: '助手' } })
    expect(wrapper.find('.ui-avatar__img').attributes('src')).toBe('/a.png')
    await wrapper.setProps({ avatar: '/b.png' })
    expect(wrapper.find('.ui-avatar__img').attributes('src')).toBe('/b.png')
  })

  it('#actions 插槽的提供与否即时反映为操作区的增删', async () => {
    const Host = defineComponent({
      props: { withActions: { type: Boolean, default: false } },
      setup: (props) => () =>
        h(Message, null, {
          default: () => '正文',
          ...(props.withActions ? { actions: () => h('button', { type: 'button' }, '重试') } : {}),
        }),
    })
    const wrapper = mount(Host)
    expect(wrapper.find('.ui-message__actions').exists()).toBe(false)
    await wrapper.setProps({ withActions: true })
    expect(wrapper.find('.ui-message__actions').exists()).toBe(true)
    expect(wrapper.find('.ui-message__actions button').exists()).toBe(true)
  })

  it('system 角色下 avatar prop 的增删即时反映为头像列的增删', async () => {
    const wrapper = mount(Message, { props: { role: 'system' }, slots: { default: () => '通知' } })
    expect(wrapper.find('.ui-message__avatar').exists()).toBe(false)
    await wrapper.setProps({ avatar: '/sys.png' })
    expect(wrapper.find('.ui-message__avatar').exists()).toBe(true)
    await wrapper.setProps({ avatar: '' })
    expect(wrapper.find('.ui-message__avatar').exists()).toBe(false)
  })
})
