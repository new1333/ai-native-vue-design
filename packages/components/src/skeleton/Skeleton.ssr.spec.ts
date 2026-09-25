// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Skeleton from './Skeleton.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Skeleton ssr', () => {
  it('renderToString 无异常且包含 ui-skeleton 根类与 aria-hidden', async () => {
    const html = await render(() => h(Skeleton))
    expect(html).toContain('ui-skeleton')
    expect(html).toContain('aria-hidden="true"')
  })

  it('默认 line：3 行占位随 SSR 输出，末行带短尾类', async () => {
    const html = await render(() => h(Skeleton))
    expect(html.match(/class="ui-skeleton__line/g)).toHaveLength(3)
    expect(html).toContain('ui-skeleton__line--last')
  })

  it('lines=1：单行无短尾类', async () => {
    const html = await render(() => h(Skeleton, { lines: 1 }))
    expect(html.match(/class="ui-skeleton__line/g)).toHaveLength(1)
    expect(html).not.toContain('ui-skeleton__line--last')
  })

  it('circle / rect：形状类随 SSR 输出', async () => {
    expect(await render(() => h(Skeleton, { variant: 'circle' }))).toContain('ui-skeleton--circle')
    expect(await render(() => h(Skeleton, { variant: 'rect' }))).toContain('ui-skeleton--rect')
  })

  it('宽高 props 以内联样式随 SSR 输出（rect 数字 px）', async () => {
    const html = await render(() => h(Skeleton, { variant: 'rect', width: 120, height: 64 }))
    expect(html).toMatch(/width:\s*120px/)
    expect(html).toMatch(/height:\s*64px/)
  })

  it('circle：width 以正圆直径（宽高同值）随 SSR 输出', async () => {
    const html = await render(() => h(Skeleton, { variant: 'circle', width: 40 }))
    expect(html).toMatch(/width:\s*40px/)
    expect(html).toMatch(/height:\s*40px/)
  })

  it('line：height 落每一行、width 落容器，随 SSR 输出', async () => {
    const html = await render(() => h(Skeleton, { lines: 2, width: 200, height: 16 }))
    expect(html.match(/height:\s*16px/g)).toHaveLength(2)
    expect(html).toMatch(/width:\s*200px/)
  })
})
