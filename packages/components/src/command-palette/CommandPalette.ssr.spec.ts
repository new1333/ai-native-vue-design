// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；只输出 hidden 占位（ui-command-palette 根类），面板内容不泄出。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import CommandPalette from './CommandPalette.vue'
import type { CommandPaletteGroup } from './CommandPalette.types'

const GROUPS: CommandPaletteGroup[] = [
  {
    key: 'nav',
    label: '导航',
    items: [
      { key: 'home', label: '回到首页' },
      { key: 'docs', label: '打开文档', danger: true },
    ],
  },
  {
    key: 'action',
    label: '操作',
    items: [{ key: 'share', label: '分享', disabled: true }],
  },
]

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('CommandPalette ssr', () => {
  it('renderToString 无异常且包含 ui-command-palette 根类（hidden 占位）', async () => {
    const html = await render(() => h(CommandPalette, { groups: GROUPS }))
    expect(html).toContain('ui-command-palette')
    expect(html).toContain('hidden')
  })

  it('挂载前不渲染浮层：无 role=dialog/combobox/listbox/option，命令数据与默认文案不泄出', async () => {
    const html = await render(() => h(CommandPalette, { groups: GROUPS }))
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('role="combobox"')
    expect(html).not.toContain('role="listbox"')
    expect(html).not.toContain('role="option"')
    expect(html).not.toContain('ui-command-palette__panel')
    expect(html).not.toContain('回到首页')
    expect(html).not.toContain('操作')
    expect(html).not.toContain('搜索命令…')
  })

  it('modelValue=true 在服务端同样不渲染浮层（浮层仅客户端 mounted 门控渲染）', async () => {
    const html = await render(() => h(CommandPalette, { groups: GROUPS, modelValue: true }))
    expect(html).toContain('ui-command-palette')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('回到首页')
  })

  it('hotkey=false / placeholder / header 插槽等 props 不触发任何浏览器 API 访问（无异常渲染）', async () => {
    const html = await render(() =>
      h(
        CommandPalette,
        { groups: GROUPS, hotkey: false, placeholder: '输入命令或搜索…' },
        { header: () => h('p', {}, '快速操作') },
      ),
    )
    expect(html).toContain('ui-command-palette')
    expect(html).not.toContain('快速操作')
    expect(html).not.toContain('输入命令或搜索…')
  })

  it('同 props 两次渲染输出一致（输出稳定，可安全水合）', async () => {
    const node = () => h(CommandPalette, { groups: GROUPS })
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })
})
