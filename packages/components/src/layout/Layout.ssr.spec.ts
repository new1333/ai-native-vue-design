// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui-layout 根类、
// 语义 landmark 标签与 has-sider / 折叠档类；验证 matchMedia 不在 SSR 期被触碰。
import { describe, expect, it, vi } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Layout from './Layout.vue'
import LayoutContent from './LayoutContent.vue'
import LayoutFooter from './LayoutFooter.vue'
import LayoutHeader from './LayoutHeader.vue'
import LayoutSider from './LayoutSider.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Layout ssr', () => {
  it('纵向骨架：renderToString 无异常且包含 ui-layout 根类与语义 landmark 标签', async () => {
    const html = await render(() =>
      h(Layout, null, {
        default: () => [
          h(LayoutHeader, { key: 'h' }, { default: () => '顶栏' }),
          h(LayoutContent, { key: 'c' }, { default: () => '主内容' }),
          h(LayoutFooter, { key: 'f' }, { default: () => '页脚' }),
        ],
      }),
    )
    expect(html).toContain('ui-layout')
    expect(html).not.toContain('ui-layout--has-sider')
    expect(html).toContain('<header')
    expect(html).toContain('<main')
    expect(html).toContain('<footer')
    expect(html).toContain('顶栏')
    expect(html).toContain('主内容')
    expect(html).toContain('页脚')
  })

  it('含 LayoutSider 直接子节点：横向 has-sider 类随 SSR 输出（渲染期静态推导）', async () => {
    const html = await render(() =>
      h(Layout, null, {
        default: () => [
          h(LayoutSider, { key: 's' }, { default: () => '侧栏导航' }),
          h(LayoutContent, { key: 'c' }, { default: () => '主内容' }),
        ],
      }),
    )
    expect(html).toContain('ui-layout--has-sider')
    expect(html).toContain('<aside')
    expect(html).toContain('侧栏导航')
  })

  it('折叠初始态：defaultCollapsed 折叠档类随 SSR 输出（客户端水合一致）', async () => {
    const html = await render(() => h(LayoutSider, { defaultCollapsed: true }, { default: () => '侧栏' }))
    expect(html).toContain('ui-layout__sider--collapsed')
    expect(html).toContain('侧栏')
  })

  it('collapsible：折叠触发器与 aria 属性随 SSR 输出', async () => {
    const html = await render(() => h(LayoutSider, { collapsible: true }))
    expect(html).toContain('<button')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('aria-controls=')
    expect(html).toContain('aria-label="切换侧栏"')
  })

  it('breakpoint：SSR 期不触碰 matchMedia，按初始展开态输出且无异常', async () => {
    const matchMedia = vi.fn()
    vi.stubGlobal('matchMedia', matchMedia)
    try {
      const html = await render(() => h(LayoutSider, { breakpoint: 'md' }))
      expect(matchMedia).not.toHaveBeenCalled()
      expect(html).toContain('ui-layout__sider')
      expect(html).not.toContain('ui-layout__sider--collapsed')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('经典 SaaS 壳（嵌套 Layout）：两层骨架与全部区域随 SSR 输出', async () => {
    const html = await render(() =>
      h(Layout, null, {
        default: () => [
          h(LayoutSider, { key: 's' }, { default: () => '主导航' }),
          h(Layout, { key: 'inner' }, { default: () => [
            h(LayoutHeader, { key: 'h' }, { default: () => '顶栏' }),
            h(LayoutContent, { key: 'c' }, { default: () => '主内容' }),
            h(LayoutFooter, { key: 'f' }, { default: () => '页脚' }),
          ] }),
        ],
      }),
    )
    expect(html).toContain('ui-layout--has-sider')
    expect(html).toContain('主导航')
    expect(html).toContain('顶栏')
    expect(html).toContain('主内容')
    expect(html).toContain('页脚')
  })
})
