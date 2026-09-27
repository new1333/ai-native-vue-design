// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Accordion from './Accordion.vue'
import type { AccordionItem, AccordionItemScope } from './Accordion.types'

const ITEMS: AccordionItem[] = [
  { key: 'a', title: '条款 A', content: '条款 A 的正文。' },
  { key: 'b', title: '条款 B', content: '条款 B 的正文。' },
  { key: 'c', title: '条款 C', content: '条款 C 的正文。', disabled: true },
]

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Accordion ssr', () => {
  it('renderToString 无异常且包含 ui-accordion 根类', async () => {
    const html = await render(() => h(Accordion, { items: ITEMS }))
    expect(html).toContain('ui-accordion')
    expect(html).toContain('<button')
  })

  it('默认档（无 modelValue）：全部收起随 SSR 输出——aria-expanded=false、面板 hidden', async () => {
    const html = await render(() => h(Accordion, { items: ITEMS }))
    expect((html.match(/aria-expanded="false"/g) ?? []).length).toBe(ITEMS.length)
    // Vue SSR 将 boolean hidden 渲染为裸属性 ` hidden`（不会与 aria-hidden 混淆）
    expect((html.match(/ hidden/g) ?? []).length).toBe(ITEMS.length)
    expect(html).not.toContain('aria-expanded="true"')
    expect(html).not.toContain('ui-accordion__item--open')
  })

  it('受控单开：aria-expanded=true / role="region" / aria-labelledby 配对随 SSR 输出', async () => {
    const html = await render(() => h(Accordion, { items: ITEMS, modelValue: 'a' }))
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('ui-accordion__item--open')
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-labelledby="ui-accordion-')
    expect(html).toContain('aria-controls="ui-accordion-')
  })

  it('多开 + 禁用条目：disabled 属性与展开状态形态随 SSR 输出', async () => {
    const html = await render(() =>
      h(Accordion, { items: ITEMS, modelValue: ['a', 'c'], multiple: true }),
    )
    expect(html).toContain('disabled')
    const trueCount = (html.match(/aria-expanded="true"/g) ?? []).length
    expect(trueCount).toBe(2)
  })

  it('作用域插槽（title / icon / default）随 SSR 输出', async () => {
    const html = await render(() =>
      h(Accordion, { items: ITEMS, modelValue: 'a' }, {
        title: (scope: AccordionItemScope) =>
          h('span', { class: 'slot-title' }, `${scope.index + 1}·${scope.item.title}`),
        default: (scope: AccordionItemScope) =>
          h('p', { class: 'slot-body' }, `正文：${scope.item.key}`),
      }),
    )
    expect(html).toContain('1·条款 A')
    expect(html).toContain('正文：a')
    expect(html).not.toContain('条款 A 的正文。')
  })

  it('icon 插槽：自定义 svg 随 SSR 输出（缺省 chevron 不渲染）', async () => {
    const html = await render(() =>
      h(Accordion, { items: ITEMS }, { icon: () => h('svg', { class: 'slot-icon' }) }),
    )
    expect(html).toContain('slot-icon')
    expect(html).not.toContain('stroke-width="1.5"')
  })
})
