// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Avatar from './Avatar.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Avatar ssr', () => {
  it('renderToString 无异常且包含 ui-avatar 根类', async () => {
    const html = await render(() => h(Avatar, { name: '纸面', alt: '纸面' }))
    expect(html).toContain('ui-avatar')
    expect(html).toContain('<span')
  })

  it('图片态：src / alt / 默认尺寸档随 SSR 输出，无 role 切换', async () => {
    const html = await render(() => h(Avatar, { src: '/u/zhang.png', alt: '张三' }))
    expect(html).toContain('ui-avatar--md')
    expect(html).toMatch(/<img[^>]*src="\/u\/zhang\.png"/)
    expect(html).toMatch(/<img[^>]*alt="张三"/)
    expect(html).not.toContain('role="img"')
    expect(html).not.toContain('ui-avatar__fallback')
  })

  it('回退态：role="img" + aria-label 与首字母随 SSR 输出', async () => {
    const html = await render(() => h(Avatar, { name: 'Zhang San', alt: '张三' }))
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="张三"')
    expect(html).toContain('ui-avatar__fallback')
    expect(html).toContain('ZS')
    expect(html).not.toContain('<img')
  })

  it('initials 优先于 name 推导，且 aria-hidden 随 SSR 输出', async () => {
    const html = await render(() => h(Avatar, { initials: 'AI', alt: 'AI 助手' }))
    expect(html).toContain('AI')
    expect(html).toContain('aria-hidden="true"')
  })

  it('尺寸档位 sm / lg 类随 SSR 输出', async () => {
    expect(await render(() => h(Avatar, { alt: 'a', size: 'sm' }))).toContain('ui-avatar--sm')
    expect(await render(() => h(Avatar, { alt: 'a', size: 'lg' }))).toContain('ui-avatar--lg')
  })
})
