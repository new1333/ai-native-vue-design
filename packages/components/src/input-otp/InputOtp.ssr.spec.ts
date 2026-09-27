// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import InputOtp from './InputOtp.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('InputOtp ssr', () => {
  it('renderToString 无异常且包含 ui-input-otp 根类、role=group 与默认 6 格', async () => {
    const html = await render(() => h(InputOtp))
    expect(html).toContain('ui-input-otp')
    expect(html).toContain('role="group"')
    expect(html.match(/<input/g)).toHaveLength(6)
  })

  it('受控值按位分发：value 属性随 SSR 输出（超长截断到格数）', async () => {
    const html = await render(() => h(InputOtp, { modelValue: '1234567890' }))
    expect(html).toContain('value="1"')
    expect(html).toContain('value="6"')
    expect(html).not.toContain('value="7"')
  })

  it('masked / inputmode / maxlength 随 SSR 输出', async () => {
    const html = await render(() => h(InputOtp, { masked: true }))
    expect(html).toContain('type="password"')
    const plain = await render(() => h(InputOtp))
    expect(plain).toContain('type="text"')
    expect(plain).toContain('inputmode="numeric"')
    expect(plain).toContain('maxlength="1"')
  })

  it('disabled：原生 disabled 与修饰类随 SSR 输出', async () => {
    const html = await render(() => h(InputOtp, { disabled: true }))
    expect(html).toContain('ui-input-otp--disabled')
    expect(html).toContain('disabled')
  })

  it('每格 aria-label 与首格 one-time-code 随 SSR 输出', async () => {
    const html = await render(() => h(InputOtp))
    expect(html).toContain('aria-label="第 1 位，共 6 位"')
    expect(html).toContain('aria-label="第 6 位，共 6 位"')
    expect(html).toContain('autocomplete="one-time-code"')
  })

  it('length 决定格数与 aria-label 总数', async () => {
    const html = await render(() => h(InputOtp, { length: 4 }))
    expect(html.match(/<input/g)).toHaveLength(4)
    expect(html).toContain('aria-label="第 4 位，共 4 位"')
  })

  it('separator 插槽随 SSR 输出（length - 1 处，aria-hidden）', async () => {
    const html = await render(() =>
      h(InputOtp, { length: 3 }, { separator: () => h('span', '-') }),
    )
    expect(html.match(/ui-input-otp__separator/g)).toHaveLength(2)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('-')
  })

  it('attrs 透传在 SSR 即落位 role=group 容器（id / aria-label）', async () => {
    const html = await render(() =>
      h(InputOtp, { id: 'otp-field', 'aria-label': '短信验证码' }),
    )
    expect(html).toMatch(/id="otp-field"/)
    expect(html).toContain('aria-label="短信验证码"')
  })
})
