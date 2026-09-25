// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Progress from './Progress.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Progress ssr', () => {
  it('renderToString 无异常且包含 ui-progress、role="progressbar" 与 min/max', async () => {
    const html = await render(() => h(Progress))
    expect(html).toContain('ui-progress')
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-valuemin="0"')
    expect(html).toContain('aria-valuemax="100"')
  })

  it('确定态：aria-valuenow 与填充内联宽度随 SSR 输出', async () => {
    const html = await render(() => h(Progress, { value: 42 }))
    expect(html).toContain('aria-valuenow="42"')
    expect(html).toMatch(/width:\s*42%/)
  })

  it('indeterminate：无 aria-valuenow，扫描修饰类随 SSR 输出', async () => {
    const html = await render(() => h(Progress, { indeterminate: true }))
    expect(html).not.toContain('aria-valuenow')
    expect(html).toContain('ui-progress__fill--indeterminate')
  })

  it('showLabel：标签文本随 SSR 输出；indeterminate 下不输出标签', async () => {
    const html = await render(() => h(Progress, { value: 7, showLabel: true }))
    expect(html).toContain('ui-progress__label')
    expect(html).toContain('7%')

    const indeterminate = await render(() => h(Progress, { indeterminate: true, showLabel: true }))
    expect(indeterminate).not.toContain('ui-progress__label')
  })

  it('size=sm：ui-progress--sm 修饰类随 SSR 输出', async () => {
    const html = await render(() => h(Progress, { size: 'sm' }))
    expect(html).toContain('ui-progress--sm')
  })
})
