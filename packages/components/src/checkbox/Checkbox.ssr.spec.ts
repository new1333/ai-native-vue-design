// @vitest-environment node
// ssr spec：node 环境 renderToString 无异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Checkbox from './Checkbox.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Checkbox ssr', () => {
  it('renderToString 无异常且包含 ui-checkbox 根类与原生 checkbox', async () => {
    const html = await render(() => h(Checkbox, { label: '选项' }))
    expect(html).toContain('ui-checkbox')
    expect(html).toContain('type="checkbox"')
  })

  it('label prop / 默认插槽内容随 SSR 输出', async () => {
    const byProp = await render(() => h(Checkbox, { label: '同意协议' }))
    expect(byProp).toContain('同意协议')
    const bySlot = await render(() => h(Checkbox, null, { default: () => h('b', '加粗选项') }))
    expect(bySlot).toContain('<b>加粗选项</b>')
  })

  it('modelValue=true：checked 属性随 SSR 输出；false 时不输出', async () => {
    expect(await render(() => h(Checkbox, { modelValue: true }))).toContain('checked')
    const off = await render(() => h(Checkbox))
    expect(off).not.toContain('checked')
  })

  it('disabled 随 SSR 输出', async () => {
    expect(await render(() => h(Checkbox, { disabled: true }))).toContain('disabled')
  })

  it('indeterminate 为 DOM property：SSR 输出不含该 attribute（客户端 onMounted 后同步）', async () => {
    const html = await render(() => h(Checkbox, { indeterminate: true }))
    expect(html).toContain('ui-checkbox--indeterminate')
    expect(html).not.toContain('indeterminate=')
  })

  it('attrs 透传在 SSR 即落位原生 checkbox（id / aria-label）', async () => {
    const html = await render(() => h(Checkbox, { id: 'ssr-cb', 'aria-label': '选择' }))
    expect(html).toMatch(/<input[^>]*id="ssr-cb"/)
    expect(html).toMatch(/<input[^>]*aria-label="选择"/)
  })
})
