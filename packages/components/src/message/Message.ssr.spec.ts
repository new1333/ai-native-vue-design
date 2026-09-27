// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Message from './Message.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Message ssr', () => {
  it('renderToString 无异常且包含 ui-message 根类（默认 assistant）', async () => {
    const html = await render(() => h(Message, null, { default: () => '正文' }))
    expect(html).toContain('ui-message')
    expect(html).toContain('ui-message--assistant')
    expect(html).toContain('正文')
  })

  it('全 props：role/name/timestamp/status/streaming 与头像均随 SSR 输出', async () => {
    const html = await render(() =>
      h(Message, { role: 'user', name: '我', avatar: '/u.png', timestamp: '14:30', status: 'sent' }, {
        default: () => '帮我汇总周报',
      }),
    )
    expect(html).toContain('ui-message--user')
    expect(html).toContain('ui-message__name')
    expect(html).toContain('我')
    expect(html).toContain('14:30')
    expect(html).toContain('ui-message__status')
    expect(html).toContain('已发送')
    expect(html).toContain('帮我汇总周报')
    // 头像走 Avatar 图片路径：<img> 带 src 服务端输出
    expect(html).toContain('ui-message__avatar')
    expect(html).toContain('src="/u.png"')
    // 未流式：无光标节点
    expect(html).not.toContain('ui-message__caret')
  })

  it('streaming：光标节点随 SSR 输出（纯 CSS 动画，服务端静态节点）', async () => {
    const html = await render(() => h(Message, { role: 'assistant', streaming: true }, { default: () => '生成中' }))
    expect(html).toContain('ui-message__caret')
    expect(html).toContain('aria-busy="true"')
  })

  it('status="error"：根修饰类与徽标文案随 SSR 输出', async () => {
    const html = await render(() => h(Message, { status: 'error' }, { default: () => '内容' }))
    expect(html).toContain('ui-message--status-error')
    expect(html).toContain('发送失败')
  })

  it('system 角色：居中变体类输出，且不渲染内建头像列', async () => {
    const html = await render(() => h(Message, { role: 'system' }, { default: () => '会话已结束' }))
    expect(html).toContain('ui-message--system')
    expect(html).toContain('会话已结束')
    expect(html).not.toContain('ui-message__avatar')
  })

  it('三个插槽（default 作用域 / avatar / actions）内容全部随 SSR 输出', async () => {
    const html = await render(() =>
      h(Message, { role: 'user', name: '我', timestamp: '10:00', status: 'error' }, {
        default: ({ message }: { message: { role: string; timestamp?: string } }) =>
          h('em', { class: 'scope-probe' }, `${message.role}/${message.timestamp ?? '-'}`),
        avatar: () => h('b', { class: 'custom-avatar' }, '我'),
        actions: () => h('button', { type: 'button', class: 'retry' }, '重新发送'),
      }),
    )
    expect(html).toContain('scope-probe')
    expect(html).toContain('user/10:00')
    expect(html).toContain('custom-avatar')
    expect(html).toContain('重新发送')
    expect(html).toContain('<button')
  })
})
