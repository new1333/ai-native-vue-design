// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；role/aria-checked/aria-busy/disabled 随 SSR 输出。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Switch from './Switch.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Switch ssr', () => {
  it('renderToString 无异常且包含 ui-switch 根类、role="switch" 与 aria-checked', async () => {
    const html = await render(() => h(Switch, { label: '通知' }))
    expect(html).toContain('ui-switch')
    expect(html).toContain('role="switch"')
    expect(html).toContain('aria-checked="false"')
    expect(html).toContain('通知')
  })

  it('modelValue=true：aria-checked="true" 与 checked 修饰类随 SSR 输出', async () => {
    const html = await render(() => h(Switch, { modelValue: true }))
    expect(html).toContain('aria-checked="true"')
    expect(html).toContain('ui-switch--checked')
  })

  it('loading：aria-busy="true" 随 SSR 输出且不出现 disabled；指示 svg 静态输出', async () => {
    const html = await render(() => h(Switch, { loading: true }))
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain('disabled')
    expect(html).toContain('ui-switch__spinner')
  })

  it('disabled 随 SSR 输出', async () => {
    expect(await render(() => h(Switch, { disabled: true }))).toContain('disabled')
  })

  it('size=sm 档类随 SSR 输出', async () => {
    expect(await render(() => h(Switch, { size: 'sm' }))).toContain('ui-switch--sm')
  })

  it('默认档不输出 aria-busy 与 loading 指示', async () => {
    const html = await render(() => h(Switch))
    expect(html).not.toContain('aria-busy')
    expect(html).not.toContain('ui-switch__spinner')
  })

  it('attrs 透传在 SSR 即落位内部 button（id / aria-label）', async () => {
    const html = await render(() => h(Switch, { id: 'ssr-switch', 'aria-label': '静音' }))
    expect(html).toMatch(/<button[^>]*id="ssr-switch"/)
    expect(html).toMatch(/<button[^>]*aria-label="静音"/)
  })
})
