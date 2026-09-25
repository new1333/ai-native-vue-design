// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类；浮层仅客户端（SSR 不出现 listbox/option）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Select from './Select.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Select ssr', () => {
  it('renderToString 无异常且包含 ui-select 根类与 combobox 触发器', async () => {
    const html = await render(() => h(Select))
    expect(html).toContain('ui-select')
    expect(html).toContain('<button')
    expect(html).toContain('role="combobox"')
  })

  it('默认档：默认 placeholder、aria-expanded=false、aria-controls 随 SSR 输出，无 disabled', async () => {
    const html = await render(() => h(Select))
    expect(html).toContain('请选择')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls="ui-select-listbox-')
    expect(html).not.toContain('disabled')
  })

  it('浮层仅客户端：SSR 输出不含 listbox / option / 空态文案', async () => {
    const html = await render(() => h(Select, { options: [{ label: '草稿', value: 'draft' }], emptyText: '暂无选项' }))
    expect(html).not.toContain('role="listbox"')
    expect(html).not.toContain('role="option"')
    expect(html).not.toContain('暂无选项')
  })

  it('已选值：触发器显示选项 label 而非 placeholder', async () => {
    const html = await render(() =>
      h(Select, {
        options: [
          { label: '草稿', value: 'draft' },
          { label: '已发布', value: 'published' },
        ],
        modelValue: 'published',
      }),
    )
    expect(html).toContain('已发布')
    expect(html).not.toContain('请选择')
  })

  it('disabled / 自定义 placeholder / 数字 value 随 SSR 输出', async () => {
    const html = await render(() =>
      h(Select, {
        options: [{ label: '小', value: 1 }, { label: '大', value: 2 }],
        modelValue: 1,
        placeholder: '选择尺寸',
        disabled: true,
      }),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('小')
    expect(html).not.toContain('选择尺寸')
  })

  it('clearable + 有值：清空按钮与 aria-label="清空" 随 SSR 输出，未选不渲染', async () => {
    const options = [{ label: '草稿', value: 'draft' }]
    const withValue = await render(() => h(Select, { options, modelValue: 'draft', clearable: true }))
    expect(withValue).toContain('ui-select__clear')
    expect(withValue).toContain('aria-label="清空"')
    const withoutValue = await render(() => h(Select, { options, clearable: true }))
    expect(withoutValue).not.toContain('ui-select__clear')
  })

  it('attrs 透传在 SSR 即落位触发器 button（id / aria-describedby）', async () => {
    const html = await render(() => h(Select, { id: 'ssr-select', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<button[^>]*id="ssr-select"/)
    expect(html).toMatch(/<button[^>]*aria-describedby="tip"/)
  })
})
