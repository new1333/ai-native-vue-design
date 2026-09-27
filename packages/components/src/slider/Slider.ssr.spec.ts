// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Slider from './Slider.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Slider ssr', () => {
  it('renderToString 无异常且包含 ui-slider 根类与 role=slider 柄', async () => {
    const html = await render(() => h(Slider))
    expect(html).toContain('ui-slider')
    expect(html).toContain('role="slider"')
    expect(html).toContain('ui-slider__rail')
  })

  it('默认档：值域 0–100、aria-valuenow 回落 min、tabindex="0" 随 SSR 输出', async () => {
    const html = await render(() => h(Slider))
    expect(html).toContain('aria-valuemin="0"')
    expect(html).toContain('aria-valuemax="100"')
    expect(html).toContain('aria-valuenow="0"')
    expect(html).toContain('tabindex="0"')
  })

  it('受控单值：aria-valuenow 与填充内联定位随 SSR 输出', async () => {
    const html = await render(() => h(Slider, { modelValue: 42 }))
    expect(html).toContain('aria-valuenow="42"')
    expect(html).toContain('left:0%')
    expect(html).toContain('width:42%')
  })

  it('range：双柄输出且缺省可读名称「最小值/最大值」落位', async () => {
    const html = await render(() => h(Slider, { range: true, modelValue: [20, 80] }))
    expect(html.split('role="slider"').length - 1).toBe(2)
    expect(html).toContain('aria-valuenow="20"')
    expect(html).toContain('aria-valuenow="80"')
    expect(html).toContain('aria-label="最小值"')
    expect(html).toContain('aria-label="最大值"')
  })

  it('vertical：ui-slider--vertical 修饰类与 aria-orientation="vertical" 随 SSR 输出', async () => {
    const html = await render(() => h(Slider, { vertical: true, modelValue: 25 }))
    expect(html).toContain('ui-slider--vertical')
    expect(html).toContain('aria-orientation="vertical"')
    expect(html).toContain('bottom:0%')
    expect(html).toContain('height:25%')
  })

  it('marks：刻度点、标签（label 优先）与覆盖态随 SSR 输出', async () => {
    const html = await render(() =>
      h(Slider, { modelValue: 50, marks: [{ value: 0, label: '低' }, { value: 50 }, { value: 100 }] }),
    )
    expect(html).toContain('ui-slider__tick')
    expect(html).toContain('ui-slider__mark')
    expect(html).toContain('低')
    expect(html).toContain('ui-slider__tick--reached')
  })

  it('disabled：tabindex="-1" 与 aria-disabled="true" 随 SSR 输出', async () => {
    const html = await render(() => h(Slider, { disabled: true, modelValue: 40 }))
    expect(html).toContain('tabindex="-1"')
    expect(html).toContain('aria-disabled="true"')
  })

  it('loading：aria-busy="true" 随 SSR 输出且不落 aria-disabled', async () => {
    const html = await render(() => h(Slider, { loading: true }))
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain('aria-disabled')
  })

  it('tooltip 气泡常驻 DOM：缺省数值内容与 aria-hidden 随 SSR 输出；插槽内容可替换', async () => {
    const plain = await render(() => h(Slider, { modelValue: 42 }))
    expect(plain).toContain('ui-slider__tooltip')
    expect(plain).toContain('aria-hidden="true"')
    expect(plain).toContain('42')

    const scoped = await render(() =>
      h(Slider, { modelValue: 42 }, { tooltip: ({ value }: { value: number }) => h('span', `${value}%`) }),
    )
    expect(scoped).toContain('42%')
  })

  it('marks 作用域插槽随 SSR 输出', async () => {
    const html = await render(() =>
      h(
        Slider,
        { modelValue: 50, marks: [{ value: 0, label: '低' }] },
        { marks: ({ mark }: { mark: { label?: string } }) => h('em', mark.label ?? '') },
      ),
    )
    expect(html).toContain('<em>低</em>')
  })

  it('attrs 透传在 SSR 即落位低值柄（id / aria-describedby）', async () => {
    const html = await render(() => h(Slider, { id: 'volume-slider', 'aria-describedby': 'volume-hint' }))
    expect(html).toMatch(/ui-slider__handle[^>]*id="volume-slider"/)
    expect(html).toMatch(/ui-slider__handle[^>]*aria-describedby="volume-hint"/)
  })
})
