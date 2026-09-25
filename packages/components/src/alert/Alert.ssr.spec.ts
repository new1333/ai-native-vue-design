// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Alert from './Alert.vue'
import { ALERT_SEVERITIES } from './Alert.constants'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Alert ssr', () => {
  it('renderToString 无异常且包含 ui-alert 根类与默认 role=status', async () => {
    const html = await render(() => h(Alert, { title: '服务端渲染' }))
    expect(html).toContain('ui-alert')
    expect(html).toContain('ui-alert--info')
    expect(html).toContain('role="status"')
    expect(html).toContain('服务端渲染')
  })

  it('四档 severity 修饰类与 role 推导随 SSR 输出', async () => {
    const expectedRoles = { info: 'status', success: 'status', warning: 'status', danger: 'alert' } as const
    for (const severity of ALERT_SEVERITIES) {
      const html = await render(() => h(Alert, { severity }))
      expect(html).toContain(`ui-alert--${severity}`)
      expect(html).toContain(`role="${expectedRoles[severity]}"`)
    }
  })

  it('标题 + 正文 + 关闭按钮 + aria-label 全量渲染（无浏览器 API 访问）', async () => {
    const html = await render(() =>
      h(Alert, { title: '额度即将用尽', closable: true }, { default: () => '本月已使用 90%。' }),
    )
    expect(html).toContain('额度即将用尽')
    expect(html).toContain('ui-alert__body')
    expect(html).toContain('本月已使用 90%。')
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('aria-label="关闭"')
  })

  it('内建语义图标 svg 随 SSR 输出且 aria-hidden', async () => {
    const html = await render(() => h(Alert, { severity: 'success' }))
    expect(html).toContain('ui-alert__icon-svg')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('viewBox="0 0 24 24"')
  })

  it('#icon 插槽内容随 SSR 输出', async () => {
    const html = await render(() =>
      h(Alert, null, { icon: () => h('svg', { viewBox: '0 0 24 24', class: 'custom-icon' }) }),
    )
    expect(html).toContain('custom-icon')
    expect(html).not.toContain('ui-alert__icon-svg')
  })

  it('danger：role="alert" 与 danger 柔底类随 SSR 输出', async () => {
    const html = await render(() => h(Alert, { severity: 'danger', title: '保存失败' }))
    expect(html).toContain('role="alert"')
    expect(html).toContain('ui-alert--danger')
  })
})
