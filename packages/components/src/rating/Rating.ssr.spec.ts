// @vitest-environment node
// ssr spec：node 环境 renderToString 无异常；radiogroup/radio/aria-checked/aria-label/tabindex/aria-readonly 随 SSR 输出。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Rating from './Rating.vue'
import type { RatingProps } from './Rating.types'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

function renderRating(props: RatingProps & Record<string, unknown> = {}): Promise<string> {
  return render(() => h(Rating, props))
}

describe('Rating ssr', () => {
  it('renderToString 无异常：根含 ui-rating、role="radiogroup" 与默认 5 档 radio', async () => {
    const html = await renderRating({ 'aria-label': '满意度' })
    expect(html).toContain('ui-rating')
    expect(html).toContain('role="radiogroup"')
    expect(html).toContain('aria-label="满意度"')
    expect(html.match(/role="radio"/g)).toHaveLength(5)
  })

  it('未评分：无 aria-checked="true"，首档 tabindex="0"', async () => {
    const html = await renderRating({ count: 3 })
    expect(html).not.toContain('aria-checked="true"')
    expect(html.match(/aria-checked="false"/g)).toHaveLength(3)
    expect(html.match(/tabindex="0"/g)).toHaveLength(1)
  })

  it('已评分：命中档输出 aria-checked="true" 与 roving tabindex="0"', async () => {
    const html = await renderRating({ count: 5, modelValue: 3 })
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1)
    expect(html).toContain('aria-label="3 星"')
    expect(html.match(/tabindex="0"/g)).toHaveLength(1)
  })

  it('allowHalf：档位数为星数 ×2，半档可读名称随 SSR 输出', async () => {
    const html = await renderRating({ count: 2, allowHalf: true })
    expect(html.match(/role="radio"/g)).toHaveLength(4)
    expect(html).toContain('aria-label="0.5 星"')
    expect(html).toContain('aria-label="1.5 星"')
    expect(html).toContain('ui-rating--half')
  })

  it('readonly：aria-readonly="true" 输出且档位全部 tabindex="-1"', async () => {
    const html = await renderRating({ count: 3, readonly: true })
    expect(html).toContain('aria-readonly="true"')
    expect(html).toContain('ui-rating--readonly')
    expect(html.match(/tabindex="-1"/g)).toHaveLength(3)
    expect(html).not.toContain('tabindex="0"')
  })

  it('默认星形 SVG 与 aria-hidden 图标层随 SSR 输出', async () => {
    const html = await renderRating({ count: 1 })
    expect(html).toContain('viewBox="0 0 24 24"')
    expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(2)
  })

  it('icon 插槽内容随 SSR 输出', async () => {
    const html = await render(
      () => h(Rating, { count: 2, modelValue: 1 }, { icon: (scope: { state: string }) => h('b', scope.state) }),
    )
    expect(html).toContain('<b>full</b>')
    expect(html).toContain('<b>empty</b>')
  })

  it('attrs 透传在 SSR 即落位根容器', async () => {
    const html = await renderRating({ count: 2, 'aria-label': '评分', 'data-testid': 'rate' })
    expect(html).toMatch(/<div[^>]*aria-label="评分"/)
    expect(html).toMatch(/<div[^>]*data-testid="rate"/)
  })
})
