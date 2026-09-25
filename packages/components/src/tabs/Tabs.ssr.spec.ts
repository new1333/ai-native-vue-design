// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Tabs from './Tabs.vue'
import TabsList from './TabsList.vue'
import TabsTrigger from './TabsTrigger.vue'
import TabsContent from './TabsContent.vue'

interface TabsSsrProps {
  value?: string
  defaultValue?: string
  variant?: 'line' | 'pill'
}

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

function renderTabs(props: TabsSsrProps = {}): Promise<string> {
  return render(() =>
    h(Tabs, props, {
      default: () => [
        h(TabsList, { key: 'list' }, () => [
          h(TabsTrigger, { key: 'a', value: 'a' }, () => '甲'),
          h(TabsTrigger, { key: 'b', value: 'b' }, () => '乙'),
        ]),
        h(TabsContent, { key: 'ca', value: 'a' }, () => '面板甲'),
        h(TabsContent, { key: 'cb', value: 'b' }, () => '面板乙'),
      ],
    }),
  )
}

describe('Tabs ssr', () => {
  it('renderToString 无异常且包含 ui-tabs 根类与 tablist/tab/tabpanel 角色', async () => {
    const html = await renderTabs()
    expect(html).toContain('ui-tabs')
    expect(html).toContain('ui-tabs--line')
    expect(html).toContain('role="tablist"')
    expect(html).toContain('role="tab"')
    expect(html).toContain('role="tabpanel"')
  })

  it('服务端自动激活首个 trigger：aria-selected=true 落位，仅激活面板渲染', async () => {
    const html = await renderTabs()
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('aria-selected="false"')
    expect(html).toContain('面板甲')
    expect(html).not.toContain('面板乙')
  })

  it('aria-controls / aria-labelledby 在 SSR 输出中指向真实存在的元素 id', async () => {
    const html = await renderTabs()
    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1]
    const labelledby = /aria-labelledby="([^"]+)"/.exec(html)?.[1]
    expect(controls).toBeDefined()
    expect(labelledby).toBeDefined()
    expect(html).toContain(`id="${controls}"`)
    expect(html).toContain(`id="${labelledby}"`)
  })

  it('roving tabindex 随 SSR 输出：激活 trigger 无覆写，其余 -1', async () => {
    const html = await renderTabs()
    expect(html).toContain('tabindex="-1"')
  })

  it('defaultValue 在服务端生效（指定面板渲染）', async () => {
    const html = await renderTabs({ defaultValue: 'b' })
    expect(html).toContain('面板乙')
    expect(html).not.toContain('面板甲')
  })

  it('受控 value 在服务端生效', async () => {
    const html = await renderTabs({ value: 'b' })
    expect(html).toContain('面板乙')
    expect(html).not.toContain('面板甲')
  })

  it('variant 修饰类随 SSR 输出', async () => {
    const html = await renderTabs({ variant: 'pill' })
    expect(html).toContain('ui-tabs--pill')
  })
})
