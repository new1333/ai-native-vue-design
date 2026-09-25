// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Card from './Card.vue'
import CardBody from './CardBody.vue'
import CardFooter from './CardFooter.vue'
import CardHeader from './CardHeader.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Card ssr', () => {
  it('renderToString 无异常且包含 ui-card 根类', async () => {
    const html = await render(() => h(Card))
    expect(html).toContain('ui-card')
    expect(html).toContain('<div')
  })

  it('默认档：shadow=none 随 SSR 输出，无 rest 阴影类', async () => {
    const html = await render(() => h(Card, null, { default: () => '正文' }))
    expect(html).toContain('ui-card--shadow-none')
    expect(html).not.toContain('ui-card--shadow-rest')
    expect(html).toContain('正文')
  })

  it('shadow="rest"：阴影档位类随 SSR 输出', async () => {
    const html = await render(() => h(Card, { shadow: 'rest' }))
    expect(html).toContain('ui-card--shadow-rest')
  })

  it('三段式组合：header / body / footer 与内容全部随 SSR 输出', async () => {
    const html = await render(() =>
      h(Card, null, {
        default: () => [
          h(CardHeader, { key: 'h' }, { default: () => '部署概览' }),
          h(CardBody, { key: 'b' }, { default: () => '最近一次部署于 2 小时前完成。' }),
          h(CardFooter, { key: 'f' }, { default: () => '更新于 2 小时前' }),
        ],
      }),
    )
    expect(html).toContain('ui-card__header')
    expect(html).toContain('ui-card__body')
    expect(html).toContain('ui-card__footer')
    expect(html).toContain('部署概览')
    expect(html).toContain('最近一次部署于 2 小时前完成。')
    expect(html).toContain('更新于 2 小时前')
  })

  it('插槽内原生标题元素随 SSR 输出（标题语义在服务端即成立）', async () => {
    const html = await render(() =>
      h(Card, null, {
        default: () => h(CardHeader, null, { default: () => h('h3', '周报') }),
      }),
    )
    expect(html).toContain('<h3')
    expect(html).toContain('周报')
  })
})
