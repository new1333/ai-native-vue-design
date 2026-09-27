// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import type { BreadcrumbItem } from './Breadcrumb.types'
import Breadcrumb from './Breadcrumb.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

function fourItems(): BreadcrumbItem[] {
  return [
    { key: 'a', label: '甲', href: '/a' },
    { key: 'b', label: '乙' },
    { key: 'c', label: '丙', href: '/c', disabled: true },
    { key: 'd', label: '丁' },
  ]
}

function renderBreadcrumb(props: { items: BreadcrumbItem[]; maxCount?: number; separator?: string }): Promise<string> {
  return render(() => h(Breadcrumb, props))
}

describe('Breadcrumb ssr', () => {
  it('renderToString 无异常且包含 nav.ui-breadcrumb 根类、aria-label 与 ol 列表', async () => {
    const html = await renderBreadcrumb({ items: fourItems() })
    expect(html).toContain('ui-breadcrumb')
    expect(html).toContain('<nav')
    expect(html).toContain('aria-label="面包屑"')
    expect(html).toContain('<ol')
    expect(html).toContain('<li')
  })

  it('全部项与链接语义随 SSR 输出：a[href] / button / disabled span', async () => {
    const html = await renderBreadcrumb({ items: fourItems() })
    expect(html).toContain('href="/a"')
    expect(html).toContain('<button type="button"')
    expect(html).toContain('甲')
    expect(html).toContain('乙')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('丙')
    expect(html).toContain('丁')
  })

  it('末项 aria-current="page" 在服务端落位', async () => {
    const html = await renderBreadcrumb({ items: fourItems() })
    expect((html.match(/aria-current="page"/g) ?? [])).toHaveLength(1)
  })

  it('maxCount 折叠在服务端生效：省略号占位出现，被折叠项不出现', async () => {
    const items = ['一', '二', '三', '四', '五', '六'].map((label, index) => ({ key: `k${index}`, label }))
    const html = await renderBreadcrumb({ items, maxCount: 4 })
    expect(html).toContain('…')
    expect(html).toContain('一')
    expect(html).not.toContain('二')
    expect(html).toContain('五')
    expect(html).toContain('六')
    expect(html).toContain('aria-current="page"')
  })

  it('separator prop 文本与 aria-hidden 装饰随 SSR 输出', async () => {
    const html = await renderBreadcrumb({ items: fourItems(), separator: '/' })
    expect((html.match(/aria-hidden="true"/g) ?? []).length).toBeGreaterThanOrEqual(3)
    expect(html).toContain('/')
  })

  it('空 items：renderToString 无异常且为空列表', async () => {
    const html = await renderBreadcrumb({ items: [] })
    expect(html).toContain('ui-breadcrumb')
    expect(html).not.toContain('ui-breadcrumb__item')
  })
})
