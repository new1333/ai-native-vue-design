// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约内容。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import ToolCallCard from './ToolCallCard.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('ToolCallCard ssr', () => {
  it('renderToString 无异常且包含 ui-tool-call-card 根类', async () => {
    const html = await render(() => h(ToolCallCard, { name: 'web_search' }))
    expect(html).toContain('ui-tool-call-card')
    expect(html).toContain('<div')
  })

  it('默认档：status=queued 的修饰类与标签随 SSR 输出，live region 属性直出', async () => {
    const html = await render(() => h(ToolCallCard, { name: 'web_search' }))
    expect(html).toContain('ui-tool-call-card--queued')
    expect(html).toContain('ui-tool-call-card__status--neutral')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('排队中')
    expect(html).toContain('web_search')
  })

  it('各状态档位类与标签随 SSR 输出', async () => {
    for (const [status, css, label] of [
      ['running', 'ui-tool-call-card__status--info', '运行中'],
      ['completed', 'ui-tool-call-card__status--success', '已完成'],
      ['failed', 'ui-tool-call-card__status--danger', '失败'],
      ['waitingApproval', 'ui-tool-call-card__status--warning', '待审批'],
    ] as const) {
      const html = await render(() => h(ToolCallCard, { name: 'x', status }))
      expect(html).toContain(css)
      expect(html).toContain(label)
    }
  })

  it('waitingApproval：审批按钮（含 disabled）与审批组语义随 SSR 输出', async () => {
    const html = await render(() =>
      h(ToolCallCard, { name: 'run_sql', status: 'waitingApproval', disabled: true }),
    )
    expect(html).toContain('ui-tool-call-card__approval')
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="人工审批"')
    expect(html).toContain('批准')
    expect(html).toContain('拒绝')
    expect(html).toContain('disabled')
  })

  it('入参/结果/时长内容随 SSR 输出（JSON 序列化在服务端完成）', async () => {
    const html = await render(() =>
      h(ToolCallCard, {
        name: 'run_sql',
        args: { sql: 'SELECT 1' },
        result: 'ok',
        status: 'completed',
        duration: 1500,
      }),
    )
    expect(html).toContain('入参')
    expect(html).toContain('&quot;sql&quot;: &quot;SELECT 1&quot;')
    expect(html).toContain('结果')
    expect(html).toContain('1.5s')
  })

  it('插槽内容（header / args / footer）随 SSR 输出', async () => {
    const html = await render(() =>
      h(ToolCallCard, { name: 'x', args: { q: 1 } }, {
        header: () => h('div', '自定义头部'),
        args: ({ formatted }: { formatted: string }) => h('div', `格式化:${formatted}`),
        footer: () => h('button', { type: 'button' }, '重试'),
      }),
    )
    expect(html).toContain('自定义头部')
    expect(html).toContain('格式化:')
    expect(html).toContain('重试')
  })

  it('failed 状态的错误结果代码块类随 SSR 输出', async () => {
    const html = await render(() =>
      h(ToolCallCard, { name: 'x', status: 'failed', result: 'Error: denied' }),
    )
    expect(html).toContain('ui-tool-call-card__code--error')
    expect(html).toContain('Error: denied')
  })
})
