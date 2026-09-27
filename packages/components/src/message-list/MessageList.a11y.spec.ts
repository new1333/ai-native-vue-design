// a11y spec：role="log" 聊天日志语义 / tabindex=0 键盘可达滚动 / 按键不拦截 / 有名地标透传 / 空态文本 / 条目语义由插槽自带。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import type { DefineComponent } from 'vue'
import MessageList from './MessageList.vue'
import { MESSAGE_LIST_EMPTY_TITLE } from './MessageList.constants'
import type { MessageListProps } from './MessageList.types'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages: Message[] = [
  { id: 1, role: 'user', content: '你好' },
  { id: 2, role: 'assistant', content: '你好，有什么可以帮你？' },
]

/** 泛型组件的 T 无法经 VTU mount 推断：以 Message 实参显式收窄桥接（显式类型桥接，非 any）。 */
const MessageListFixture = MessageList as unknown as DefineComponent<MessageListProps<Message>>

describe('MessageList a11y', () => {
  it('role="log"（WAI-ARIA 聊天日志模式：region 子类，新内容隐式 aria-live=polite 播报）', () => {
    const wrapper = mount(MessageListFixture, { props: { messages } })
    expect(wrapper.attributes('role')).toBe('log')
  })

  it('滚动视口 tabindex="0"：键盘用户可 Tab 进入并用方向键/PageUp 原生滚动', () => {
    // focus 依赖文档挂载：attachTo 后验证可聚焦性，测试完卸载还原 document。
    const wrapper = mount(MessageListFixture, {
      attachTo: document.body,
      props: { messages },
    })
    expect(wrapper.attributes('tabindex')).toBe('0')
    const el = wrapper.find('.ui-message-list').element as HTMLElement
    el.focus()
    expect(document.activeElement).toBe(el)
    wrapper.unmount()
  })

  it('键盘路径不被拦截：ArrowDown / PageUp / Home 等 keydown 均 defaultPrevented=false，组件不消费', () => {
    const wrapper = mount(MessageListFixture, { props: { messages, autoScroll: false } })
    const el = wrapper.find('.ui-message-list').element as HTMLElement
    el.focus()
    for (const key of ['ArrowDown', 'ArrowUp', 'PageUp', 'PageDown', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    // 组件不监听/消费任何按键：keydown 不产生滚动透传事件。
    expect(wrapper.emitted('scroll')).toBeUndefined()
  })

  it('aria-label 透传到滚动容器（帮助 AT 定位会话地标）', () => {
    const wrapper = mount(MessageListFixture, {
      props: { messages },
      attrs: { 'aria-label': '会话消息' },
    })
    expect(wrapper.attributes('aria-label')).toBe('会话消息')
  })

  it('aria-labelledby 同样透传', () => {
    const wrapper = mount(MessageListFixture, {
      props: { messages },
      attrs: { 'aria-labelledby': 'session-title' },
    })
    expect(wrapper.attributes('aria-labelledby')).toBe('session-title')
  })

  it('空态：缺省渲染 EmptyState（可读文本「暂无消息」）；empty 插槽可自定义', () => {
    const emptyWrapper = mount(MessageListFixture, { props: { messages: [] } })
    expect(emptyWrapper.find('.ui-message-list__empty').exists()).toBe(true)
    expect(emptyWrapper.find('.ui-message-list__empty').text()).toContain(MESSAGE_LIST_EMPTY_TITLE)

    const customWrapper = mount(MessageListFixture, {
      props: { messages: [] },
      slots: { empty: () => '还没有对话，说点什么吧' },
    })
    expect(customWrapper.find('.ui-message-list__empty').text()).toBe('还没有对话，说点什么吧')
  })

  it('条目语义由 default 插槽内容自带（插槽内可用原生交互元素）', () => {
    const wrapper = mount(MessageListFixture, {
      props: { messages },
      slots: {
        default: ({ message }: { message: Message }) =>
          h('button', { type: 'button' }, `重发 ${message.content}`),
      },
    })
    const buttons = wrapper.findAll('.ui-message-list__item button')
    expect(buttons).toHaveLength(messages.length)
    expect(buttons[0]?.attributes('type')).toBe('button')
    expect(buttons[0]?.text()).toBe('重发 你好')
  })

  it('每条消息渲染为 log 的一个条目容器（ui-message-list__item）', () => {
    const wrapper = mount(MessageListFixture, {
      props: { messages },
      slots: { default: ({ message }: { message: Message }) => message.content },
    })
    const items = wrapper.findAll('.ui-message-list__item')
    expect(items).toHaveLength(messages.length)
    expect(items[1]?.text()).toBe('你好，有什么可以帮你？')
  })
})
