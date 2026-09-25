// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Input from './Input.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Input ssr', () => {
  it('renderToString 无异常且包含 ui-input 根类与原生 input', async () => {
    const html = await render(() => h(Input))
    expect(html).toContain('ui-input')
    expect(html).toContain('<input')
  })

  it('默认档：type="text"、ui-input--default 随 SSR 输出，无 aria-invalid/disabled', async () => {
    const html = await render(() => h(Input, { placeholder: '标题' }))
    expect(html).toContain('type="text"')
    expect(html).toContain('placeholder="标题"')
    expect(html).toContain('ui-input--default')
    expect(html).not.toContain('aria-invalid')
    expect(html).not.toContain('disabled')
  })

  it('password / maxlength / readonly / disabled / 受控值全量随 SSR 输出', async () => {
    const html = await render(() =>
      h(Input, { type: 'password', maxlength: 32, readonly: true, disabled: true, modelValue: 'secret' }),
    )
    expect(html).toContain('type="password"')
    expect(html).toContain('maxlength="32"')
    expect(html).toContain('readonly')
    expect(html).toContain('disabled')
    expect(html).toContain('value="secret"')
  })

  it('status=error：aria-invalid="true" 与 ui-input--error 随 SSR 输出', async () => {
    const html = await render(() => h(Input, { status: 'error' }))
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('ui-input--error')
  })

  it('prefix / suffix 插槽随 SSR 输出', async () => {
    const html = await render(() =>
      h(Input, null, {
        prefix: () => h('svg', { viewBox: '0 0 24 24' }),
        suffix: () => '字',
      }),
    )
    expect(html).toContain('ui-input__prefix')
    expect(html).toContain('ui-input__suffix')
    expect(html).toContain('字')
  })

  it('clearable：有值时清空按钮与 aria-label="清空" 随 SSR 输出，无值不渲染', async () => {
    const withValue = await render(() => h(Input, { clearable: true, modelValue: 'abc' }))
    expect(withValue).toContain('ui-input__clear')
    expect(withValue).toContain('aria-label="清空"')
    const empty = await render(() => h(Input, { clearable: true }))
    expect(empty).not.toContain('ui-input__clear')
  })

  it('attrs 透传在 SSR 即落位原生 input（id / aria-describedby）', async () => {
    const html = await render(() => h(Input, { id: 'ssr-input', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<input[^>]*id="ssr-input"/)
    expect(html).toMatch(/<input[^>]*aria-describedby="tip"/)
  })
})
