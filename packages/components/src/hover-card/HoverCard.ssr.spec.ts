// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；挂载前不渲染浮层，只输出触发元素（含 ui-hover-card 根类）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import HoverCard from './HoverCard.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

const node = () =>
  h(
    HoverCard,
    { placement: 'top' },
    {
      trigger: () => h('button', { type: 'button' }, '查看'),
      default: () => '预览卡内容',
    },
  )

describe('HoverCard ssr', () => {
  it('renderToString 无异常且包含 ui-hover-card 根类', async () => {
    const html = await render(node)
    expect(html).toContain('ui-hover-card')
  })

  it('触发元素随 SSR 输出：含 aria-expanded="false"（开合状态对读屏可见）', async () => {
    const html = await render(node)
    expect(html).toContain('<button')
    expect(html).toContain('查看')
    expect(html).toContain('aria-expanded="false"')
  })

  it('挂载前不渲染浮层：无卡片、无 role="dialog"、无内容、无 aria-controls', async () => {
    const html = await render(node)
    expect(html).not.toContain('ui-hover-card__card')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('预览卡内容')
    expect(html).not.toContain('aria-controls')
  })

  it('受控 modelValue=true 同样不渲染浮层（Teleport 推迟到客户端）', async () => {
    const html = await render(
      () =>
        h(
          HoverCard,
          { modelValue: true },
          {
            trigger: () => h('button', { type: 'button' }, '查看'),
            default: () => '预览卡内容',
          },
        ),
    )
    expect(html).not.toContain('ui-hover-card__card')
    expect(html).not.toContain('预览卡内容')
  })

  it('同 props 两次渲染输出一致（可安全水合）', async () => {
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })
})
