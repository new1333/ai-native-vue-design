// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与插槽内容。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import EmptyState from './EmptyState.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('EmptyState ssr', () => {
  it('renderToString 无异常且包含 ui-empty-state 根类与内建图标', async () => {
    const html = await render(() => h(EmptyState))
    expect(html).toContain('ui-empty-state')
    expect(html).toContain('ui-empty-state__icon-svg')
    expect(html).toContain('viewBox="0 0 24 24"')
  })

  it('title / description 随 SSR 输出（无浏览器 API 访问）', async () => {
    const html = await render(() =>
      h(EmptyState, { title: '暂无数据', description: '创建第一条记录试试。' }),
    )
    expect(html).toContain('ui-empty-state__title')
    expect(html).toContain('暂无数据')
    expect(html).toContain('ui-empty-state__description')
    expect(html).toContain('创建第一条记录试试。')
  })

  it('#icon 与 #action 插槽内容随 SSR 输出', async () => {
    const html = await render(() =>
      h(EmptyState, null, {
        icon: () => h('svg', { viewBox: '0 0 24 24', class: 'custom-icon' }),
        action: () => h('button', { type: 'button' }, '新建记录'),
      }),
    )
    expect(html).toContain('custom-icon')
    expect(html).not.toContain('ui-empty-state__icon-svg')
    expect(html).toContain('ui-empty-state__action')
    expect(html).toContain('<button')
    expect(html).toContain('新建记录')
  })

  it('完整组合：图标 + 标题 + 说明 + 操作全量渲染', async () => {
    const html = await render(() =>
      h(
        EmptyState,
        { title: '没有找到匹配结果', description: '调整筛选条件后重试。' },
        { action: () => h('button', { type: 'button' }, '清除筛选') },
      ),
    )
    expect(html).toContain('ui-empty-state__icon-svg')
    expect(html).toContain('没有找到匹配结果')
    expect(html).toContain('调整筛选条件后重试。')
    expect(html).toContain('清除筛选')
  })
})
