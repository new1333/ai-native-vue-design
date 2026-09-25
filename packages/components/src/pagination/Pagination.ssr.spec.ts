// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，页码序列 / aria 契约 / 边界禁用随 SSR 输出。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import Pagination from './Pagination.vue'
import type { PaginationProps } from './Pagination.types'

function render(props: PaginationProps): Promise<string> {
  return renderToString(createSSRApp({ render: () => h(Pagination, props) }))
}

describe('Pagination ssr', () => {
  it('renderToString 无异常且包含 ui-pagination 根类与 nav aria-label="分页"', async () => {
    const html = await render({ total: 100, page: 5 })
    expect(html).toContain('ui-pagination')
    expect(html).toContain('aria-label="分页"')
    expect(html).toContain('<nav')
  })

  it('默认档：单页 "1"（aria-current="page"），上一页/下一页均 disabled，无省略号', async () => {
    const html = await render({})
    expect(html).toContain('ui-pagination__page')
    expect(html).toContain('aria-current="page"')
    expect(html).not.toContain('ui-pagination__ellipsis')
    expect(html.match(/disabled/g) ?? []).toHaveLength(2)
  })

  it('窗口模式：page=5 → 首尾 + 双省略号 + 当前页 aria-current="page" 随 SSR 输出', async () => {
    const html = await render({ total: 100, page: 5 })
    expect(html).toContain('…')
    expect(html.match(/ui-pagination__ellipsis/g) ?? []).toHaveLength(2)
    expect(html).toContain('aria-current="page"')
    expect(html).toMatch(/>\s*4\s*</)
    expect(html).toMatch(/>\s*5\s*</)
    expect(html).toMatch(/>\s*6\s*</)
    expect(html).toMatch(/>\s*10\s*</)
  })

  it('全显模式：total=70 → 页码 1..7 全部随 SSR 输出，无省略号', async () => {
    const html = await render({ total: 70, page: 4 })
    for (const page of ['1', '2', '3', '4', '5', '6', '7']) {
      expect(html).toMatch(new RegExp(`>\\s*${page}\\s*</button>`))
    }
    expect(html).not.toContain('…')
  })

  it('上一页/下一页 aria-label 与边界 disabled 随 SSR 输出', async () => {
    const first = await render({ total: 100, page: 1 })
    expect(first).toContain('aria-label="上一页"')
    expect(first).toContain('aria-label="下一页"')
    const navButtons = first.match(/<button[^>]*ui-pagination__nav[^>]*>/g) ?? []
    expect(navButtons[0]).toContain('disabled')
    expect(navButtons[1]).not.toContain('disabled')
    const last = await render({ total: 100, page: 10 })
    const lastButtons = last.match(/<button[^>]*ui-pagination__nav[^>]*>/g) ?? []
    expect(lastButtons[0]).not.toContain('disabled')
    expect(lastButtons[1]).toContain('disabled')
  })

  it('siblingCount=2：SSR 即按宽窗口输出（3..7 + 首尾 + 双省略号）', async () => {
    const html = await render({ total: 100, page: 5, siblingCount: 2 })
    for (const page of ['3', '4', '5', '6', '7']) {
      expect(html).toMatch(new RegExp(`>\\s*${page}\\s*</button>`))
    }
    expect(html.match(/ui-pagination__ellipsis/g) ?? []).toHaveLength(2)
  })
})
