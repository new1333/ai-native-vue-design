// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { DefineComponent, VNode } from 'vue'
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

/** 泛型组件的 T 无法经 h 推断：以 Message 实参显式收窄桥接（显式类型桥接，非 any）。 */
const MessageListFixture = MessageList as unknown as DefineComponent<MessageListProps<Message>>
/** 异构消息（string）用例的桥接。 */
const MessageListLooseFixture = MessageList as unknown as DefineComponent<MessageListProps<unknown>>

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('MessageList ssr', () => {
  it('renderToString 无异常且包含 ui-message-list 根类、role="log" 与 tabindex', async () => {
    const html = await render(() => h(MessageListFixture, { messages }))
    expect(html).toContain('ui-message-list')
    expect(html).toContain('role="log"')
    expect(html).toContain('tabindex="0"')
  })

  it('数据模式：消息条目与内容随 SSR 输出', async () => {
    const html = await render(() =>
      h(MessageListFixture, { messages }, {
        default: ({ message }: { message: Message }) => `[${message.role}] ${message.content}`,
      }),
    )
    expect(html).toContain('ui-message-list__item')
    expect(html).toContain('[user] 你好')
    expect(html).toContain('[assistant] 你好，有什么可以帮你？')
  })

  it('default 插槽缺省：string 消息文本随 SSR 输出', async () => {
    const html = await render(() => h(MessageListLooseFixture, { messages: ['你好', '再见'] }))
    expect(html).toContain('ui-message-list__item')
    expect(html).toContain('你好')
    expect(html).toContain('再见')
  })

  it('分发模式：默认插槽内容原样随 SSR 输出（__content 包裹）', async () => {
    const html = await render(() =>
      h(MessageListFixture, { messages: undefined }, {
        default: () => [h('div', { class: 'bubble' }, '气泡内容')],
      }),
    )
    expect(html).toContain('ui-message-list__content')
    expect(html).toContain('bubble')
    expect(html).toContain('气泡内容')
  })

  it('空态：默认 EmptyState 标题「暂无消息」随 SSR 输出', async () => {
    const html = await render(() => h(MessageListFixture, { messages: [] }))
    expect(html).toContain('ui-message-list__empty')
    expect(html).toContain(MESSAGE_LIST_EMPTY_TITLE)
  })

  it('empty 插槽随 SSR 输出', async () => {
    const html = await render(() =>
      h(MessageListFixture, { messages: [] }, { empty: () => '还没有对话' }),
    )
    expect(html).toContain('还没有对话')
  })

  it('autoScroll=false 等纯客户端 props 不影响 SSR 渲染', async () => {
    const html = await render(() =>
      h(MessageListLooseFixture, { messages: ['你好', '再见'], autoScroll: false, nearBottomThreshold: 120 }),
    )
    expect(html).toContain('ui-message-list')
    expect(html).toContain('你好')
  })
})
