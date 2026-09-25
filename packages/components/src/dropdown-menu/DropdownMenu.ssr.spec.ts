// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；输出含 ui- 根类与触发器契约，浮层内容不泄出。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import DropdownMenu from './DropdownMenu.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('DropdownMenu ssr', () => {
  it('renderToString 无异常且包含 ui-dropdown-menu 根类与原生 button 触发器', async () => {
    const html = await render(() => h(DropdownMenu, { items: [{ key: 'a', label: '甲' }] }, { default: () => '操作' }))
    expect(html).toContain('ui-dropdown-menu')
    expect(html).toContain('<button')
    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('操作')
  })

  it('插槽为单个元素：SSR 输出该元素并带合并后的 aria（无内建触发器 button）', async () => {
    const html = await render(() =>
      h(
        DropdownMenu,
        { items: [{ key: 'a', label: '甲' }] },
        { default: () => h('span', { class: 'custom-trigger' }, '操作') },
      ),
    )
    expect(html).toContain('<span')
    expect(html).toContain('custom-trigger')
    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('aria-expanded="false"')
    // 单元素插槽：该元素即触发元素，内建触发器 button 不渲染
    expect(html).not.toContain('ui-dropdown-menu__trigger')
    expect(html).toContain('操作')
  })

  it('挂载前不渲染浮层：无 role=menu/menuitem，菜单项 label 不随 Teleport 泄出', async () => {
    const html = await render(() =>
      h(
        DropdownMenu,
        { items: [{ key: 'edit', label: '编辑' }, { key: 'delete', label: '删除', danger: true }] },
        { default: () => '操作' },
      ),
    )
    expect(html).not.toContain('role="menu"')
    expect(html).not.toContain('role="menuitem"')
    expect(html).not.toContain('ui-dropdown-menu__panel')
    expect(html).not.toContain('编辑')
    expect(html).not.toContain('删除')
  })

  it('danger / disabled / align 等 props 不触发任何浏览器 API 访问（无异常渲染）', async () => {
    const html = await render(() =>
      h(
        DropdownMenu,
        {
          align: 'end',
          items: [
            { key: 'a', label: '甲', disabled: true },
            { key: 'b', label: '乙', danger: true },
          ],
        },
        { default: () => '更多' },
      ),
    )
    expect(html).toContain('ui-dropdown-menu__trigger')
    expect(html).toContain('更多')
  })

  it('同 props 两次渲染输出一致（输出稳定，可安全水合）', async () => {
    const node = () =>
      h(DropdownMenu, { items: [{ key: 'a', label: '甲' }] }, { default: () => '操作' })
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })
})
