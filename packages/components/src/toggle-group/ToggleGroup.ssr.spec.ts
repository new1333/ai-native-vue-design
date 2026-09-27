// @vitest-environment node
// ssr spec：node 环境 renderToString 无异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import ToggleGroup from './ToggleGroup.vue'
import ToggleItem from './ToggleItem.vue'

const items = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙' },
]

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('ToggleGroup ssr', () => {
  it('renderToString 无异常且包含 ui-toggle-group 根类、radiogroup 角色与各项文案', async () => {
    const html = await render(() => h(ToggleGroup, { items, modelValue: 'a' }))
    expect(html).toContain('ui-toggle-group')
    expect(html).toContain('role="radiogroup"')
    expect(html).toContain('甲')
    expect(html).toContain('乙')
    expect(html).toContain('丙')
  })

  it('single 选中：aria-checked="true" 恰好落在一项，其余为 false', async () => {
    const html = await render(() => h(ToggleGroup, { items, modelValue: 'b' }))
    expect((html.match(/aria-checked="true"/g) ?? [])).toHaveLength(1)
    expect((html.match(/aria-checked="false"/g) ?? [])).toHaveLength(2)
  })

  it('multiple：role="group" + aria-pressed 随数组受控值输出', async () => {
    const html = await render(() =>
      h(ToggleGroup, { items, type: 'multiple', modelValue: ['a', 'c'] }),
    )
    expect(html).toContain('role="group"')
    expect((html.match(/aria-pressed="true"/g) ?? [])).toHaveLength(2)
    expect((html.match(/aria-pressed="false"/g) ?? [])).toHaveLength(1)
  })

  it('roving tabindex 随 SSR 输出：首个可用项 0、其余 -1', async () => {
    const html = await render(() => h(ToggleGroup, { items }))
    expect((html.match(/tabindex="0"/g) ?? [])).toHaveLength(1)
    expect((html.match(/tabindex="-1"/g) ?? [])).toHaveLength(2)
  })

  it('首项禁用时 roving 落点正确让位于第二个可用项', async () => {
    const html = await render(() =>
      h(ToggleGroup, { items: [{ ...items[0]!, disabled: true }, items[1]!, items[2]!] }),
    )
    expect(html).toContain('disabled')
    expect((html.match(/tabindex="0"/g) ?? [])).toHaveLength(1)
  })

  it('整组禁用随 SSR 输出', async () => {
    const html = await render(() => h(ToggleGroup, { items, disabled: true }))
    expect((html.match(/disabled/g) ?? []).length).toBeGreaterThanOrEqual(3)
  })

  it('item 作用域插槽内容随 SSR 渲染', async () => {
    const html = await render(() =>
      h(ToggleGroup, { items }, { item: ({ item }: { item: { label: string } }) => h('em', item.label) }),
    )
    expect(html).toContain('<em>甲</em>')
  })

  it('默认插槽手动组合 ToggleItem 亦可 SSR（含 role / aria-checked）', async () => {
    const html = await render(() =>
      h(ToggleGroup, { modelValue: 'x' }, { default: () => h(ToggleItem, { value: 'x', label: '子项' }) }),
    )
    expect(html).toContain('ui-toggle-group')
    expect(html).toContain('子项')
    expect(html).toContain('role="radio"')
    expect(html).toContain('aria-checked="true"')
  })
})
