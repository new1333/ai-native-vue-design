// api spec：props 默认值 / slots 渲染（default 带作用域 / avatar / actions）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Message from './Message.vue'
import { MESSAGE_ROLE_DEFAULT, MESSAGE_ROLE_LABEL, MESSAGE_STATUS_TEXT } from './Message.constants'

describe('Message api', () => {
  it('渲染 ui-message 根容器（div），默认 role=assistant 修饰类', () => {
    const wrapper = mount(Message)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-message')
    expect(wrapper.classes()).toContain('ui-message--assistant')
    expect(wrapper.classes()).not.toContain('ui-message--user')
    expect(wrapper.classes()).not.toContain('ui-message--system')
  })

  it('role="user" / role="system"：修饰类落位', () => {
    expect(mount(Message, { props: { role: 'user' } }).classes()).toContain('ui-message--user')
    expect(mount(Message, { props: { role: 'system' } }).classes()).toContain('ui-message--system')
  })

  it('默认（全 props 缺省）：无 name / 时间 / 状态徽标 / 流式光标，无 aria-busy', () => {
    const wrapper = mount(Message, { slots: { default: () => '正文' } })
    expect(wrapper.find('.ui-message__name').exists()).toBe(false)
    expect(wrapper.find('.ui-message__time').exists()).toBe(false)
    expect(wrapper.find('.ui-message__status').exists()).toBe(false)
    expect(wrapper.find('.ui-message__caret').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    // 默认 meta 行不渲染（无任何 meta 内容时）
    expect(wrapper.find('.ui-message__meta').exists()).toBe(false)
  })

  it('name / timestamp：meta 行文本渲染', () => {
    const wrapper = mount(Message, { props: { name: '纸面助手', timestamp: '14:32' }, slots: { default: () => '正文' } })
    expect(wrapper.find('.ui-message__name').text()).toBe('纸面助手')
    expect(wrapper.find('.ui-message__time').text()).toBe('14:32')
  })

  it('default 插槽内容渲染进气泡，作用域 message 含全部上下文字段', () => {
    const wrapper = mount(Message, {
      props: { name: '我', timestamp: '14:30', streaming: true, status: 'sent' },
      slots: {
        default: `<template #default="{ message }">
          <em class="scope-probe">{{ message.role }}|{{ message.name }}|{{ message.timestamp }}|{{ message.streaming }}|{{ message.status }}</em>
        </template>`,
      },
    })
    expect(wrapper.find('.scope-probe').text()).toBe('assistant|我|14:30|true|sent')
    expect(wrapper.find('.ui-message__content').text()).toContain('assistant|我|14:30|true|sent')
  })

  it('status：三档徽标文案与修饰类，缺省不渲染徽标', () => {
    const sending = mount(Message, { props: { status: 'sending' } })
    expect(sending.find('.ui-message__status').text()).toContain(MESSAGE_STATUS_TEXT.sending)
    expect(sending.find('.ui-message__status--sending').exists()).toBe(true)
    expect(sending.find('.ui-message__status-dot').exists()).toBe(true)

    const sent = mount(Message, { props: { status: 'sent' } })
    expect(sent.find('.ui-message__status').text()).toContain(MESSAGE_STATUS_TEXT.sent)
    expect(sent.find('.ui-message__status--sent').exists()).toBe(true)
    expect(sent.find('.ui-message__status-icon').exists()).toBe(true)

    const error = mount(Message, { props: { status: 'error' } })
    expect(error.find('.ui-message__status').text()).toContain(MESSAGE_STATUS_TEXT.error)
    expect(error.find('.ui-message__status--error').exists()).toBe(true)
    // error 额外置根修饰类（气泡描边染 danger 的钩子）
    expect(error.classes()).toContain('ui-message--status-error')
    expect(sent.classes()).not.toContain('ui-message--status-error')
  })

  it('内置头像复用 Avatar：回退态可读名称取 name，缺省回落角色称谓', () => {
    const named = mount(Message, { props: { name: '张三' } })
    const namedAvatar = named.find('.ui-avatar')
    expect(namedAvatar.exists()).toBe(true)
    expect(namedAvatar.attributes('aria-label')).toBe('张三')

    const unnamed = mount(Message, { props: { role: 'user' } })
    expect(unnamed.find('.ui-avatar').attributes('aria-label')).toBe(MESSAGE_ROLE_LABEL.user)
  })

  it('avatar 传入时渲染 <img>（复用 Avatar 的图片路径）', () => {
    const wrapper = mount(Message, { props: { avatar: '/assistant.png', name: '助手' } })
    const img = wrapper.find('.ui-avatar__img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/assistant.png')
    expect(img.attributes('alt')).toBe('助手')
  })

  it('system 角色不渲染内建回退头像列；显式 avatar 或 #avatar 插槽才出现头像', () => {
    const bare = mount(Message, { props: { role: 'system' }, slots: { default: () => '系统通知' } })
    expect(bare.find('.ui-message__avatar').exists()).toBe(false)

    const withSrc = mount(Message, { props: { role: 'system', avatar: '/sys.png' } })
    expect(withSrc.find('.ui-message__avatar').exists()).toBe(true)

    const withSlot = mount(Message, {
      props: { role: 'system' },
      slots: { avatar: '<span class="custom-avatar">S</span>' },
    })
    expect(withSlot.find('.ui-message__avatar').exists()).toBe(true)
    expect(withSlot.find('.custom-avatar').exists()).toBe(true)
  })

  it('#avatar 插槽覆盖内置 Avatar', () => {
    const wrapper = mount(Message, {
      slots: { avatar: '<b class="custom-avatar">A</b>' },
    })
    expect(wrapper.find('.custom-avatar').exists()).toBe(true)
    expect(wrapper.find('.ui-avatar').exists()).toBe(false)
  })

  it('#actions 插槽渲染于气泡之下；未提供时不渲染操作区', () => {
    const withActions = mount(Message, {
      slots: { actions: '<button type="button" class="retry-btn">重试</button>' },
    })
    expect(withActions.find('.ui-message__actions').exists()).toBe(true)
    expect(withActions.find('.retry-btn').exists()).toBe(true)

    const bare = mount(Message)
    expect(bare.find('.ui-message__actions').exists()).toBe(false)
  })

  it('streaming：内容尾部渲染流式光标节点', () => {
    const wrapper = mount(Message, { props: { streaming: true }, slots: { default: () => '生成中' } })
    expect(wrapper.find('.ui-message__caret').exists()).toBe(true)
    // 光标在内容容器内、插槽内容之后
    const content = wrapper.find('.ui-message__content')
    expect(content.element.lastElementChild?.classList.contains('ui-message__caret')).toBe(true)
  })

  it('默认角色常量与组件默认一致', () => {
    expect(MESSAGE_ROLE_DEFAULT).toBe('assistant')
  })
})
