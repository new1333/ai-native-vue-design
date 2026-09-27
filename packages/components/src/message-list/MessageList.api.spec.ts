// api spec：props 默认值 / emits 声明 / slots 渲染 / 语义结构（role="log"）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import type { DefineComponent } from 'vue'
import MessageList from './MessageList.vue'
import {
  MESSAGE_LIST_EMPTY_TITLE,
  MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT,
} from './MessageList.constants'
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

/**
 * 泛型组件的 T 无法经 VTU mount 推断：以实参显式收窄桥接
 * （显式类型桥接，非 any；props 仍按 MessageListProps<T> 全量检查）。
 */
const MessageListFixture = MessageList as unknown as DefineComponent<MessageListProps<Message>>
/** 异构消息（string/number/object 混合）用例的桥接。 */
const MessageListLooseFixture = MessageList as unknown as DefineComponent<MessageListProps<unknown>>

/** happy-dom 无布局引擎：实例级模拟滚动几何（元素卸载即消失，不污染其他用例）。 */
function mockGeometry(el: Element, scrollHeight: number, clientHeight: number): void {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollHeight })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: clientHeight })
}

describe('MessageList api', () => {
  it('语义结构：根类 ui-message-list，role="log"（聊天日志模式），tabindex="0" 键盘可达', () => {
    const wrapper = mount(MessageListFixture, { props: { messages } })
    expect(wrapper.classes()).toContain('ui-message-list')
    expect(wrapper.attributes('role')).toBe('log')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.find('.ui-message-list__item').exists()).toBe(true)
  })

  it('数据模式渲染：消息条数 = messages.length，default 插槽作用域含 message/index', () => {
    const wrapper = mount(MessageListFixture, {
      props: { messages },
      slots: {
        default: ({ message, index }: { message: Message; index: number }) =>
          `${message.role}:${message.content}#${index}`,
      },
    })
    const items = wrapper.findAll('.ui-message-list__item')
    expect(items).toHaveLength(messages.length)
    expect(items[0]?.text()).toBe('user:你好#0')
    expect(items[1]?.text()).toBe('assistant:你好，有什么可以帮你？#1')
  })

  it('default 插槽缺省：string/number 消息渲染其文本；对象消息渲染为空（不报错）', () => {
    const mixed: unknown[] = ['第一条', 42, { id: 3, role: 'user', content: '对象消息' }]
    const wrapper = mount(MessageListLooseFixture, { props: { messages: mixed } })
    const items = wrapper.findAll('.ui-message-list__item')
    expect(items).toHaveLength(3)
    expect(items[0]?.text()).toBe('第一条')
    expect(items[1]?.text()).toBe('42')
    expect(items[2]?.text()).toBe('')
  })

  it('messageKey 支持函数形式（stable key 来源），渲染不报错且条数正确', () => {
    const wrapper = mount(MessageListFixture, {
      props: { messages, messageKey: (message: Message) => `msg-${message.id}` },
    })
    expect(wrapper.findAll('.ui-message-list__item')).toHaveLength(messages.length)
  })

  it('分发模式：未提供 messages 时默认插槽内容原样渲染进 __content，无 __item 结构', () => {
    const wrapper = mount(MessageListFixture, {
      slots: {
        default: () => [
          h('div', { class: 'bubble-a' }, '气泡 A'),
          h('div', { class: 'bubble-b' }, '气泡 B'),
        ],
      },
    })
    expect(wrapper.find('.ui-message-list__content').exists()).toBe(true)
    expect(wrapper.find('.ui-message-list__content .bubble-a').exists()).toBe(true)
    expect(wrapper.find('.ui-message-list__content .bubble-b').exists()).toBe(true)
    expect(wrapper.find('.ui-message-list__item').exists()).toBe(false)
    expect(wrapper.find('.ui-message-list__empty').exists()).toBe(false)
  })

  it('autoScroll 默认 true：贴底状态下内容更新后跟随到底（挂载首帧定位的确定性断言在 behavior spec）', async () => {
    const wrapper = mount(MessageListFixture, { props: { messages } })
    mockGeometry(wrapper.element, 1000, 400)
    wrapper.element.scrollTop = 960 // 贴底（distance = 1000 - 960 - 400 < 48）
    await wrapper.trigger('scroll')
    await wrapper.setProps({ messages: [...messages, { id: 3, role: 'user', content: '在吗' }] })
    expect(wrapper.element.scrollTop).toBe(1000)
    expect(wrapper.props('autoScroll')).toBe(true)
  })

  it('nearBottomThreshold 默认 48（与常量一致）', () => {
    expect(MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT).toBe(48)
    const wrapper = mount(MessageListFixture, { props: { messages } })
    expect(wrapper.props('nearBottomThreshold')).toBe(48)
  })

  it('空态默认：messages=[] 渲染 EmptyState（title「暂无消息」）', () => {
    const wrapper = mount(MessageListFixture, { props: { messages: [] } })
    expect(wrapper.find('.ui-message-list__empty').exists()).toBe(true)
    expect(wrapper.find('.ui-message-list__empty').text()).toContain(MESSAGE_LIST_EMPTY_TITLE)
    expect(wrapper.find('.ui-message-list__item').exists()).toBe(false)
  })

  it('empty 插槽覆盖默认空态', () => {
    const wrapper = mount(MessageListFixture, {
      props: { messages: [] },
      slots: { empty: () => '还没有对话' },
    })
    expect(wrapper.find('.ui-message-list__empty').text()).toBe('还没有对话')
    expect(wrapper.text()).not.toContain(MESSAGE_LIST_EMPTY_TITLE)
  })

  it('分发模式无默认插槽内容：同样落入空态', () => {
    const wrapper = mount(MessageListFixture, { props: {} })
    expect(wrapper.find('.ui-message-list__empty').exists()).toBe(true)
    expect(wrapper.find('.ui-message-list__empty').text()).toContain(MESSAGE_LIST_EMPTY_TITLE)
  })

  it('emits 声明：scroll 透传原生事件、nearBottom 挂载首帧播报、loadMore 挂载不触发', async () => {
    const wrapper = mount(MessageListFixture, { props: { messages, autoScroll: false } })
    expect(wrapper.emitted('nearBottom')).toHaveLength(1) // 挂载首帧播报（无布局 distance 0 → 贴底）
    expect(wrapper.emitted('nearBottom')?.[0]?.[0]).toBe(true)
    expect(wrapper.emitted('loadMore')).toBeUndefined()
    await wrapper.trigger('scroll')
    const scrollEvents = wrapper.emitted('scroll')
    expect(scrollEvents).toHaveLength(1)
    expect(scrollEvents?.[0]?.[0]).toBeInstanceOf(Event)
  })
})
