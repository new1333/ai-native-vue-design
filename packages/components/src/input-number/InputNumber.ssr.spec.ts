// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import InputNumber from './InputNumber.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('InputNumber ssr', () => {
  it('renderToString 无异常且包含 ui-input-number 根类与 spinbutton 原生 input', async () => {
    const html = await render(() => h(InputNumber))
    expect(html).toContain('ui-input-number')
    expect(html).toContain('<input')
    expect(html).toContain('role="spinbutton"')
  })

  it('默认档：两个步进按钮带 aria-label，无 aria-valuemin/max/now、无 disabled', async () => {
    const html = await render(() => h(InputNumber))
    expect(html).toContain('ui-input-number__decrease')
    expect(html).toContain('ui-input-number__increase')
    expect(html).toContain('aria-label="减少"')
    expect(html).toContain('aria-label="增加"')
    expect(html).not.toContain('aria-valuemin')
    expect(html).not.toContain('aria-valuemax')
    expect(html).not.toContain('aria-valuenow')
    expect(html).not.toContain('disabled')
  })

  it('min / max / 受控值全量随 SSR 输出：aria-valuemax 与 aria-valuenow 落位', async () => {
    const html = await render(() => h(InputNumber, { modelValue: 5, min: 0, max: 100 }))
    expect(html).toContain('value="5"')
    expect(html).toContain('aria-valuemin="0"')
    expect(html).toContain('aria-valuemax="100"')
    expect(html).toContain('aria-valuenow="5"')
  })

  it('受控值越界：SSR 即按钳制值输出 value 与 aria-valuenow', async () => {
    const html = await render(() => h(InputNumber, { modelValue: 99, max: 10 }))
    expect(html).toContain('value="10"')
    expect(html).toContain('aria-valuenow="10"')
  })

  it('precision：格式化展示随 SSR 输出', async () => {
    const html = await render(() => h(InputNumber, { modelValue: 1, precision: 2 }))
    expect(html).toContain('value="1.00"')
  })

  it('controls=false：SSR 不输出步进按钮', async () => {
    const html = await render(() => h(InputNumber, { controls: false }))
    expect(html).not.toContain('ui-input-number__decrease')
    expect(html).not.toContain('ui-input-number__increase')
  })

  it('disabled：input 与步进按钮的原生 disabled 随 SSR 输出', async () => {
    const html = await render(() => h(InputNumber, { disabled: true, modelValue: 3, min: 0 }))
    expect(html).toContain('disabled')
    expect(html).toContain('ui-input-number--disabled')
    expect(html).toContain('aria-valuenow="3"')
  })

  it('prefix / suffix 插槽随 SSR 输出', async () => {
    const html = await render(() =>
      h(InputNumber, null, {
        prefix: () => h('span', '¥'),
        suffix: () => '个',
      }),
    )
    expect(html).toContain('ui-input-number__prefix')
    expect(html).toContain('ui-input-number__suffix')
    expect(html).toContain('¥')
    expect(html).toContain('个')
  })

  it('attrs 透传在 SSR 即落位原生 input（id / aria-label）', async () => {
    const html = await render(() => h(InputNumber, { id: 'count-input', 'aria-label': '数量' }))
    expect(html).toMatch(/<input[^>]*id="count-input"/)
    expect(html).toMatch(/<input[^>]*aria-label="数量"/)
  })
})
