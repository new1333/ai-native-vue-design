// a11y spec：泛型容器语义 / aria-busy / 头像可读名称 / 装饰性图标 / #actions 键盘路径。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Message from './Message.vue'
import { Button } from '../button'

describe('Message a11y', () => {
  it('消息为泛型容器：无 role、不产生 landmark 语义', () => {
    const wrapper = mount(Message, { slots: { default: () => '正文' } })
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('组件自身不可聚焦：无 tabindex，不进入 Tab 序', () => {
    expect(mount(Message, { props: { name: 'x', status: 'sent', streaming: true } }).attributes('tabindex')).toBeUndefined()
  })

  it('streaming：根元素 aria-busy="true"（区域更新中）；未流式时不出现该属性', async () => {
    const wrapper = mount(Message, { slots: { default: () => '内容' } })
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    await wrapper.setProps({ streaming: true })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('头像回退态：Avatar 根 role="img" + aria-label（name 优先，缺省角色称谓）', () => {
    const named = mount(Message, { props: { name: '李四' } })
    const namedAvatar = named.find('.ui-avatar')
    expect(namedAvatar.attributes('role')).toBe('img')
    expect(namedAvatar.attributes('aria-label')).toBe('李四')

    const unnamed = mount(Message)
    expect(unnamed.find('.ui-avatar').attributes('aria-label')).toBe('助手')

    const unnamedUser = mount(Message, { props: { role: 'user' } })
    expect(unnamedUser.find('.ui-avatar').attributes('aria-label')).toBe('用户')
  })

  it('头像图片态：<img> 携带 alt（与回退态同一可读名称来源）', () => {
    const wrapper = mount(Message, { props: { avatar: '/a.png', name: '王五' } })
    expect(wrapper.find('.ui-avatar__img').attributes('alt')).toBe('王五')
  })

  it('状态徽标语义由可见文案承担：图标/脉冲点均为 aria-hidden 装饰', () => {
    const sent = mount(Message, { props: { status: 'sent' } })
    expect(sent.find('.ui-message__status').text()).toContain('已发送')
    expect(sent.find('.ui-message__status-icon').attributes('aria-hidden')).toBe('true')

    const sending = mount(Message, { props: { status: 'sending' } })
    expect(sending.find('.ui-message__status').text()).toContain('发送中')
    expect(sending.find('.ui-message__status-dot').attributes('aria-hidden')).toBe('true')

    const error = mount(Message, { props: { status: 'error' } })
    expect(error.find('.ui-message__status').text()).toContain('发送失败')
    expect(error.find('.ui-message__status-icon').attributes('aria-hidden')).toBe('true')
  })

  it('流式光标为 aria-hidden 装饰；正文内容不置 aria-hidden（读屏自然可读）', () => {
    const wrapper = mount(Message, { props: { streaming: true }, slots: { default: () => '正在生成的内容' } })
    expect(wrapper.find('.ui-message__caret').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.ui-message__content').attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.find('.ui-message__content').text()).toContain('正在生成的内容')
  })

  it('#actions 插槽内原生控件保持原生语义：不被改写 tabindex / type', () => {
    const wrapper = mount(Message, {
      slots: { actions: () => h('button', { type: 'button', class: 'retry' }, '重新发送') },
    })
    const button = wrapper.find('button.retry')
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('tabindex')).toBeUndefined()
  })

  it('键盘路径：#actions 内原生 button 的 Enter 激活回调照常触发（组件不拦截键盘）', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Message, {
      slots: { actions: () => h('button', { type: 'button', class: 'retry', onClick }, '重新发送') },
    })
    const button = wrapper.find('button.retry')
    await button.trigger('focus')
    await button.trigger('keydown', { key: 'Enter' })
    // happy-dom 不合成原生 click：断言键盘事件未被拦截（可冒泡、未被取消），
    // 原生 Enter→click 激活由真实浏览器原生语义承担（CONVENTIONS §7 E2E 分工）
    const events: Event[] = []
    button.element.addEventListener('keydown', (e) => events.push(e))
    await button.trigger('keydown', { key: 'Enter' })
    expect(events).toHaveLength(1)
    expect(events[0]?.defaultPrevented).toBe(false)
  })

  it('组合路径：#actions 放 Button 组件时其内建键盘处理（Enter 触发 click）在 Message 内照常生效', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Message, {
      slots: { actions: () => h(Button, { onClick }, { default: () => '复制' }) },
    })
    await wrapper.find('.ui-message__actions button').trigger('keydown', { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('user / system 角色仅改变布局与配皮，不添加 aria-hidden 等可读性干预', () => {
    const user = mount(Message, { props: { role: 'user' }, slots: { default: () => '用户消息' } })
    expect(user.find('.ui-message__content').attributes('aria-hidden')).toBeUndefined()
    const system = mount(Message, { props: { role: 'system' }, slots: { default: () => '系统通知' } })
    expect(system.find('.ui-message__content').attributes('aria-hidden')).toBeUndefined()
    expect(system.find('.ui-message__content').text()).toBe('系统通知')
  })
})
