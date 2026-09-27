// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Statistic from './Statistic.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Statistic ssr', () => {
  it('renderToString 无异常且包含 ui-statistic 根类与数值文本', async () => {
    const html = await render(() => h(Statistic, { value: 42 }))
    expect(html).toContain('ui-statistic')
    expect(html).toContain('ui-statistic__value')
    expect(html).toContain('42')
  })

  it('precision/前缀/后缀/标题随 SSR 输出', async () => {
    const html = await render(() =>
      h(Statistic, { title: '总营收', value: 128430.5, precision: 2, prefix: '¥', suffix: '元' }),
    )
    expect(html).toContain('ui-statistic__title')
    expect(html).toContain('总营收')
    expect(html).toContain('128430.50')
    expect(html).toContain('¥')
    expect(html).toContain('元')
  })

  it('非 countdown：无 role 属性；countdown：role="timer" 与初始 mm:ss 随 SSR 输出', async () => {
    const plain = await render(() => h(Statistic, { value: 42 }))
    expect(plain).not.toContain('role=')

    const countdown = await render(() => h(Statistic, { value: 90, countdown: true }))
    expect(countdown).toContain('role="timer"')
    expect(countdown).toContain('ui-statistic--countdown')
    expect(countdown).toContain('01:30')
  })

  it('countdown ≥1 小时：HH:mm:ss 随 SSR 输出（计时器不在服务端起表）', async () => {
    const html = await render(() => h(Statistic, { value: 3661, countdown: true }))
    expect(html).toContain('01:01:01')
  })

  it('trend 箭头：role="img" aria-label 与修饰类随 SSR 输出，svg aria-hidden', async () => {
    const up = await render(() => h(Statistic, { value: 42, trend: 'up' }))
    expect(up).toContain('ui-statistic__trend--up')
    expect(up).toContain('role="img"')
    expect(up).toContain('aria-label="上升"')
    expect(up).toContain('aria-hidden="true"')

    const down = await render(() => h(Statistic, { value: 42, trend: 'down' }))
    expect(down).toContain('ui-statistic__trend--down')
    expect(down).toContain('aria-label="下降"')
  })

  it('插槽内容随 SSR 输出（title / default）', async () => {
    const html = await render(() =>
      h(Statistic, { value: 42 }, { title: () => '插槽标题', default: () => '四十二' }),
    )
    expect(html).toContain('插槽标题')
    expect(html).toContain('四十二')
    expect(html).not.toContain('>42<')
  })
})
