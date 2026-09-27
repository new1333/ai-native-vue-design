// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类；面板仅客户端（SSR 不出现 dialog/grid/gridcell）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import DatePicker from './DatePicker.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('DatePicker ssr', () => {
  it('renderToString 无异常且包含 ui-date-picker 根类与触发器按钮', async () => {
    const html = await render(() => h(DatePicker))
    expect(html).toContain('ui-date-picker')
    expect(html).toContain('<button')
    expect(html).toContain('aria-haspopup="dialog"')
  })

  it('默认档：默认占位、aria-expanded=false、aria-controls 随 SSR 输出，无 disabled/aria-busy', async () => {
    const html = await render(() => h(DatePicker))
    expect(html).toContain('选择日期')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls="ui-date-picker-panel-')
    expect(html).not.toContain('disabled')
    expect(html).not.toContain('aria-busy')
  })

  it('面板仅客户端：SSR 输出不含 dialog / grid / gridcell / 周表头 / 时间输入', async () => {
    const html = await render(() => h(DatePicker, { type: 'datetime' }))
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('role="grid"')
    expect(html).not.toContain('role="gridcell"')
    expect(html).not.toContain('columnheader')
    expect(html).not.toContain('type="time"')
  })

  it('已选值（date）：触发器显示格式化值而非占位', async () => {
    const html = await render(() => h(DatePicker, { modelValue: '2026-03-15' }))
    expect(html).toContain('2026-03-15')
    expect(html).not.toContain('选择日期')
  })

  it('已选值（datetime / range）：含时间的值与范围串随 SSR 输出', async () => {
    const datetime = await render(() =>
      h(DatePicker, { type: 'datetime', modelValue: '2026-03-15 08:30' }),
    )
    expect(datetime).toContain('2026-03-15 08:30')
    const range = await render(() =>
      h(DatePicker, { type: 'range', modelValue: ['2026-03-10', '2026-03-20'] }),
    )
    expect(range).toContain('2026-03-10 ~ 2026-03-20')
  })

  it('自定义 placeholder / disabled / loading（aria-busy）随 SSR 输出', async () => {
    const placeholder = await render(() => h(DatePicker, { placeholder: '选择发稿日' }))
    expect(placeholder).toContain('选择发稿日')
    const disabled = await render(() => h(DatePicker, { modelValue: '2026-03-15', disabled: true }))
    expect(disabled).toContain('disabled')
    const loading = await render(() => h(DatePicker, { modelValue: '2026-03-15', loading: true }))
    expect(loading).toContain('aria-busy="true"')
  })

  it('clearable + 有值：清空按钮与 aria-label="清空" 随 SSR 输出，未选不渲染', async () => {
    const withValue = await render(() => h(DatePicker, { modelValue: '2026-03-15', clearable: true }))
    expect(withValue).toContain('ui-date-picker__clear')
    expect(withValue).toContain('aria-label="清空"')
    const withoutValue = await render(() => h(DatePicker, { clearable: true }))
    expect(withoutValue).not.toContain('ui-date-picker__clear')
  })

  it('attrs 透传在 SSR 即落位触发器 button（id / aria-describedby）', async () => {
    const html = await render(() => h(DatePicker, { id: 'ssr-date', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<button[^>]*id="ssr-date"/)
    expect(html).toMatch(/<button[^>]*aria-describedby="tip"/)
  })
})
