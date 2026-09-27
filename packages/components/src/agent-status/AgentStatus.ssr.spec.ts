// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import AgentStatus from './AgentStatus.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('AgentStatus ssr', () => {
  it('renderToString 无异常且包含 ui-agent-status 根类、role、aria-live', async () => {
    const html = await render(() => h(AgentStatus, { status: 'running' }))
    expect(html).toContain('ui-agent-status')
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
  })

  it('默认档：status=queued 随 SSR 输出，默认文案"排队中"、静态圆点、无 Spinner', async () => {
    const html = await render(() => h(AgentStatus))
    expect(html).toContain('ui-agent-status--queued')
    expect(html).toContain('排队中')
    expect(html).toContain('ui-agent-status__dot')
    expect(html).not.toContain('ui-spinner')
  })

  it('运行态：Spinner 结构随 SSR 输出，指示区 aria-hidden', async () => {
    const html = await render(() => h(AgentStatus, { status: 'streaming' }))
    expect(html).toContain('ui-agent-status--streaming')
    expect(html).toContain('ui-spinner')
    expect(html).toContain('ui-agent-status__icon')
    expect(html).toMatch(/ui-agent-status__icon[^>]*aria-hidden="true"/)
  })

  it('failed + detail：danger 档与补充说明文本随 SSR 输出', async () => {
    const html = await render(() => h(AgentStatus, { status: 'failed', detail: 'get_weather 返回 500' }))
    expect(html).toContain('ui-agent-status--failed')
    expect(html).toContain('已失败')
    expect(html).toContain('get_weather 返回 500')
  })

  it('label 覆盖文案在 SSR 即生效', async () => {
    const html = await render(() => h(AgentStatus, { status: 'completed', label: '全量同步完成' }))
    expect(html).toContain('全量同步完成')
    expect(html).not.toContain('已完成')
  })

  it('attrs 透传在 SSR 即落位根元素（data-testid）', async () => {
    const html = await render(() => h(AgentStatus, { 'data-testid': 'ssr-run-status' }))
    expect(html).toMatch(/<div[^>]*data-testid="ssr-run-status"/)
  })
})
