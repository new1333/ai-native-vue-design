// api spec：props 默认值 / emits 声明 / slots 渲染 / 组合与 items 双模式结构。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Menu from './Menu.vue'
import MenuItem from './MenuItem.vue'
import SubMenu from './SubMenu.vue'
import type { MenuOption } from './Menu.types'

interface MenuMountProps {
  mode?: 'horizontal' | 'vertical'
  modelValue?: string
  defaultValue?: string
  collapsed?: boolean
}

/** 标准组合（甲 / 分组(甲一/甲二) / 乙）。 */
function mountMenu(props: MenuMountProps = {}) {
  return mount(Menu, {
    props,
    slots: {
      default: () => [
        h(MenuItem, { key: 'a', value: 'a' }, () => '甲'),
        h(SubMenu, { key: 's', value: 's', title: '分组' }, () => [
          h(MenuItem, { key: 's1', value: 's1' }, () => '甲一'),
          h(MenuItem, { key: 's2', value: 's2' }, () => '甲二'),
        ]),
        h(MenuItem, { key: 'b', value: 'b' }, () => '乙'),
      ],
    },
  })
}

/** 平铺三项（乙 disabled），用于 disabled 结构断言。 */
function mountFlatDisabled(props: MenuMountProps = {}) {
  return mount(Menu, {
    props,
    slots: {
      default: () => [
        h(MenuItem, { key: 'a', value: 'a' }, () => '甲'),
        h(MenuItem, { key: 'b', value: 'b', disabled: true }, () => '乙'),
        h(MenuItem, { key: 'c', value: 'c' }, () => '丙'),
      ],
    },
  })
}

const demoItems: MenuOption[] = [
  { value: 'a', label: '甲' },
  { value: 'grp', label: '分组', children: [{ value: 's1', label: '甲一' }] },
  { value: 'b', label: '乙', disabled: true },
]

function mountItems(props: MenuMountProps = {}) {
  return mount(Menu, { props: { ...props, items: demoItems } })
}

describe('Menu api', () => {
  it('渲染 ui-menu 根类 + nav 语义，默认 mode=vertical', () => {
    const wrapper = mountMenu()
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.classes()).toContain('ui-menu')
    expect(wrapper.classes()).toContain('ui-menu--vertical')
    expect(wrapper.classes()).not.toContain('ui-menu--horizontal')
  })

  it('mode="horizontal" 落 ui-menu--horizontal 修饰类', () => {
    const wrapper = mountMenu({ mode: 'horizontal' })
    expect(wrapper.classes()).toContain('ui-menu--horizontal')
  })

  it('collapsed：vertical 下落 ui-menu--collapsed；horizontal 下忽略（不落类）', () => {
    const vertical = mountMenu({ collapsed: true })
    expect(vertical.classes()).toContain('ui-menu--collapsed')
    const horizontal = mountMenu({ mode: 'horizontal', collapsed: true })
    expect(horizontal.classes()).not.toContain('ui-menu--collapsed')
  })

  it('attrs（aria-label）透传到 nav 根元素', () => {
    const wrapper = mount(Menu, {
      attrs: { 'aria-label': '站点导航' },
      slots: { default: () => [h(MenuItem, { key: 'a', value: 'a' }, () => '甲')] },
    })
    expect(wrapper.attributes('aria-label')).toBe('站点导航')
  })

  it('组合结构：ul 列表容器 + 每项 li 包裹 + 原生 button（type=button）', () => {
    const wrapper = mountMenu()
    expect(wrapper.find('ul.ui-menu-list').exists()).toBe(true)
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(5) // 甲 / 分组 / 甲一 / 甲二 / 乙
    for (const button of buttons) {
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('type')).toBe('button')
      expect(button.element.closest('li')).not.toBeNull()
    }
  })

  it('SubMenu 触发器：title 文本渲染、aria-expanded 初始 false', () => {
    const wrapper = mountMenu()
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    expect(trigger.text()).toContain('分组')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('items 模式：label 渲染、children 渲染为 SubMenu、disabled 落原生 disabled', () => {
    const wrapper = mountItems()
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(4) // 甲 / 分组 / 甲一 / 乙
    expect(wrapper.find('.ui-menu-submenu__trigger').text()).toContain('分组')
    const disabled = buttons.find(b => b.text() === '乙')
    expect(disabled?.attributes('disabled')).toBeDefined()
    expect(disabled?.classes()).toContain('ui-menu-item__button')
  })

  it('items 模式忽略默认插槽', () => {
    const wrapper = mount(Menu, {
      props: { items: [{ value: 'a', label: '甲' }] },
      slots: { default: () => [h(MenuItem, { key: 'x', value: 'x' }, () => '插槽项')] },
    })
    const texts = wrapper.findAll('button').map(b => b.text())
    expect(texts).toEqual(['甲'])
  })

  it('defaultValue：初始激活指定项（aria-current="page" 落位）', () => {
    const wrapper = mountMenu({ defaultValue: 'b' })
    const current = wrapper.findAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].text()).toBe('乙')
  })

  it('受控 modelValue 优先：激活项与之匹配', () => {
    const wrapper = mountMenu({ modelValue: 's1' })
    const current = wrapper.findAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].text()).toBe('甲一')
  })

  it('无 defaultValue/modelValue：无激活项（导航菜单不自动选中）', () => {
    const wrapper = mountMenu()
    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(0)
  })

  it('update:modelValue 与 select 已声明：点击叶子项以配对值发出', async () => {
    const wrapper = mountMenu()
    const b = wrapper.findAll('button').find(b => b.text() === '乙')!
    await b.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
    expect(wrapper.emitted('select')).toEqual([['b']])
  })

  it('MenuItem 的 #icon 插槽渲染图标容器', () => {
    const wrapper = mount(Menu, {
      slots: {
        default: () => [
          h(MenuItem, { key: 'a', value: 'a' }, { default: () => '甲', icon: () => '◆' }),
        ],
      },
    })
    const icon = wrapper.find('.ui-menu-item__icon')
    expect(icon.exists()).toBe(true)
    expect(icon.text()).toBe('◆')
    expect(wrapper.find('.ui-menu-item__label').text()).toBe('甲')
  })

  it('items 模式 #item 作用域插槽：覆盖叶子项内容并拿到 item/active/disabled', async () => {
    const wrapper = mount(Menu, {
      props: { items: demoItems, defaultValue: 'a' },
      slots: {
        item: (scope: { item: MenuOption; active: boolean; disabled: boolean }) =>
          `【${scope.item.label}|${scope.active ? '激活' : '未激活'}|${scope.disabled ? '禁用' : '可用'}】`,
      },
    })
    const a = wrapper.findAll('button').find(b => b.text().includes('甲|'))
    expect(a?.text()).toBe('【甲|激活|可用】')
    const b = wrapper.findAll('button').find(b => b.text().includes('乙'))
    expect(b?.text()).toBe('【乙|未激活|禁用】')
  })

  it('items 模式 #icon 作用域插槽：叶子项与组触发器共用', () => {
    const wrapper = mount(Menu, {
      props: { items: demoItems },
      slots: { icon: (scope: { item: MenuOption }) => scope.item.label },
    })
    const icons = wrapper.findAll('.ui-menu-item__icon, .ui-menu-submenu__icon')
    expect(icons).toHaveLength(4) // 甲 / 分组 / 甲一 / 乙
    expect(icons[0].text()).toBe('甲')
    expect(icons[1].text()).toBe('分组')
  })

  it('SubMenu 的 #title 插槽覆盖 title prop', () => {
    const wrapper = mount(Menu, {
      slots: {
        default: () => [
          h(
            SubMenu,
            { key: 's', value: 's', title: 'prop 文本' },
            { title: () => '插槽文本', default: () => [] },
          ),
        ],
      },
    })
    expect(wrapper.find('.ui-menu-submenu__trigger').text()).toContain('插槽文本')
    expect(wrapper.find('.ui-menu-submenu__trigger').text()).not.toContain('prop 文本')
  })

  it('MenuItem disabled：原生 disabled 属性 + 修饰类', () => {
    const wrapper = mountFlatDisabled()
    const b = wrapper.findAll('button').find(b => b.text() === '乙')!
    expect(b.attributes('disabled')).toBeDefined()
    expect(b.element.closest('li')?.classList.contains('ui-menu-item--disabled')).toBe(true)
  })
})
