// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Menu from './Menu.vue'
import MenuItem from './MenuItem.vue'
import SubMenu from './SubMenu.vue'
import type { MenuOption } from './Menu.types'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

interface MenuSsrProps {
  mode?: 'horizontal' | 'vertical'
  modelValue?: string
  defaultValue?: string
  collapsed?: boolean
}

/** 标准组合（甲 / 分组(甲一/甲二) / 乙）。 */
function renderMenu(props: MenuSsrProps = {}): Promise<string> {
  return render(() =>
    h(Menu, props, {
      default: () => [
        h(MenuItem, { key: 'a', value: 'a' }, () => '甲'),
        h(SubMenu, { key: 's', value: 's', title: '分组' }, () => [
          h(MenuItem, { key: 's1', value: 's1' }, () => '甲一'),
          h(MenuItem, { key: 's2', value: 's2' }, () => '甲二'),
        ]),
        h(MenuItem, { key: 'b', value: 'b' }, () => '乙'),
      ],
    }),
  )
}

const demoItems: MenuOption[] = [
  { value: 'a', label: '甲' },
  { value: 'grp', label: '分组', disabled: true, children: [{ value: 's1', label: '甲一' }] },
  { value: 'b', label: '乙' },
]

function renderItems(props: MenuSsrProps = {}): Promise<string> {
  return render(() => h(Menu, { ...props, items: demoItems }))
}

describe('Menu ssr', () => {
  it('renderToString 无异常且包含 ui-menu 根类与 nav/ul 列表结构', async () => {
    const html = await renderMenu()
    expect(html).toContain('ui-menu')
    expect(html).toContain('ui-menu--vertical')
    expect(html).toContain('<nav')
    expect(html).toContain('ui-menu-list')
    expect(html).toContain('<button')
  })

  it('mode / collapsed 修饰类随 SSR 输出', async () => {
    expect(await renderMenu({ mode: 'horizontal' })).toContain('ui-menu--horizontal')
    expect(await renderMenu({ collapsed: true })).toContain('ui-menu--collapsed')
  })

  it('无激活值时 aria-current 缺席；defaultValue 在服务端生效落 aria-current="page"', async () => {
    const plain = await renderMenu()
    expect(plain).not.toContain('aria-current')
    const withDefault = await renderMenu({ defaultValue: 'b' })
    expect(withDefault).toContain('aria-current="page"')
    expect(withDefault.indexOf('aria-current="page"')).toBeLessThan(withDefault.indexOf('乙'))
  })

  it('受控 modelValue 在服务端生效', async () => {
    const html = await renderMenu({ modelValue: 's1' })
    expect(html).toContain('aria-current="page"')
  })

  it('roving tabindex 随 SSR 输出：首个可见可用项无覆写，其余 -1（含收起组内项）', async () => {
    const html = await renderMenu()
    expect(html).not.toContain('tabindex=""')
    expect(html).toContain('tabindex="-1"')
  })

  it('SubMenu 触发器 aria-expanded="false" / aria-controls 与面板 id 互指；面板以 display:none 输出', async () => {
    const html = await renderMenu()
    expect(html).toContain('aria-expanded="false"')
    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1]
    expect(controls).toBeDefined()
    expect(html).toContain(`id="${controls}"`)
    const labelledby = /aria-labelledby="([^"]+)"/.exec(html)?.[1]
    expect(labelledby).toBeDefined()
    expect(html).toContain(`id="${labelledby}"`)
    expect(html).toContain('display:none')
  })

  it('items 模式：label 渲染、disabled 组落原生 disabled、children 面板渲染', async () => {
    const html = await renderItems()
    expect(html).toContain('ui-menu')
    expect(html).toContain('分组')
    expect(html).toContain('甲一')
    expect(html).toContain('disabled')
    expect(html).toContain('ui-menu-submenu__panel')
  })

  it('items 模式 defaultValue 服务端生效', async () => {
    const html = await renderItems({ defaultValue: 'b' })
    expect(html).toContain('aria-current="page"')
  })
})
