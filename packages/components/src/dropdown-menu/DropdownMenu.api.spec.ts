// api spec：props 默认值 / emits 声明 / slots 渲染。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import DropdownMenu from './DropdownMenu.vue'
import type { DropdownMenuItem } from './DropdownMenu.types'

/** 图标用函数式内联 SVG 组件（与使用方传法一致）。 */
const Icon = () => h('svg', { viewBox: '0 0 24 24' })

/** 启用项序 = [0 编辑, 1 复制, 3 删除]；2 为 disabled。 */
const ITEMS: DropdownMenuItem[] = [
  { key: 'edit', label: '编辑', icon: Icon },
  { key: 'copy', label: '复制' },
  { key: 'lock', label: '锁定', disabled: true },
  { key: 'delete', label: '删除', danger: true },
]

const wrappers: Array<{ unmount: () => void }> = []
function mountMenu(props: Record<string, unknown> = {}): VueWrapper {
  // attachTo document.body：触发器在文档内，focus()/activeElement 断言才与真实使用一致
  const wrapper = mount(DropdownMenu, {
    props: { items: ITEMS, ...props },
    slots: { default: () => '操作' },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

/** 打开菜单（点击触发器）并等 Teleport 渲染与初始移焦落地。 */
async function openMenu(wrapper: VueWrapper): Promise<void> {
  await wrapper.find('button.ui-dropdown-menu__trigger').trigger('click')
  await nextTick()
  await nextTick()
}

/** body 中的菜单面板（Teleport 目标）。 */
function panel(): DOMWrapper<HTMLElement> {
  const el = document.body.querySelector<HTMLElement>('.ui-dropdown-menu__panel')
  if (!el) throw new Error('菜单面板未渲染')
  return new DOMWrapper(el)
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('DropdownMenu api', () => {
  it('渲染根 div.ui-dropdown-menu 与原生 button 触发器（ui-dropdown-menu__trigger）', () => {
    const wrapper = mountMenu()
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-dropdown-menu')
    const trigger = wrapper.find('button.ui-dropdown-menu__trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('type')).toBe('button')
  })

  it('默认插槽渲染进触发器', () => {
    const wrapper = mountMenu()
    expect(wrapper.find('button.ui-dropdown-menu__trigger').text()).toBe('操作')
  })

  it('默认插槽为单个元素 vnode：该元素直接作为触发元素（aria-haspopup 落在其上，无内建触发器包裹）', () => {
    const wrapper = mount(DropdownMenu, {
      props: { items: ITEMS },
      slots: { default: () => h('button', { type: 'button', class: 'custom-trigger' }, '操作') },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    const trigger = wrapper.find('button.custom-trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('button.ui-dropdown-menu__trigger').exists()).toBe(false)
  })

  it('默认关闭态：aria-haspopup="menu"、aria-expanded="false"、无浮层渲染', () => {
    const wrapper = mountMenu()
    const trigger = wrapper.find('button.ui-dropdown-menu__trigger')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-controls')).toBeUndefined()
    expect(document.body.querySelector('.ui-dropdown-menu__flyout')).toBeNull()
  })

  it('items 按序渲染为 menuitem：数量与 label 顺序一致', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    const items = panel().findAll('.ui-dropdown-menu__item')
    expect(items).toHaveLength(4)
    expect(items.map(item => item.text())).toEqual(['编辑', '复制', '锁定', '删除'])
  })

  it('align 默认 start：面板落 ui-dropdown-menu__panel--start 修饰类', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    expect(panel().classes()).toContain('ui-dropdown-menu__panel--start')
  })

  it('align=end：面板落 ui-dropdown-menu__panel--end 修饰类', async () => {
    const wrapper = mountMenu({ align: 'end' })
    await openMenu(wrapper)
    expect(panel().classes()).toContain('ui-dropdown-menu__panel--end')
  })

  it('danger 项落 --danger 修饰类；disabled 项带原生 disabled 且 tabindex=-1', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    const items = panel().findAll('.ui-dropdown-menu__item')
    expect(items[3].classes()).toContain('ui-dropdown-menu__item--danger')
    expect(items[0].classes()).not.toContain('ui-dropdown-menu__item--danger')
    expect(items[2].attributes('disabled')).toBeDefined()
    expect(items[2].attributes('tabindex')).toBe('-1')
  })

  it('icon 组件渲染到项内图标容器（内联 svg）', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    const icons = panel().findAll('.ui-dropdown-menu__item-icon')
    expect(icons).toHaveLength(1) // 仅 edit 项声明 icon
    expect(icons[0].find('svg').exists()).toBe(true)
  })

  it('select 已声明：点击项时携带该项 key 载荷发出', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    await panel().findAll('.ui-dropdown-menu__item')[1].trigger('click')
    expect(wrapper.emitted('select')).toEqual([['copy']])
  })

  it('expose：focus/blur 聚焦与移除触发器焦点', async () => {
    // 直接 mount 以保留组件实例类型（expose 的 focus/blur 无需断言转换）
    const wrapper = mount(DropdownMenu, {
      props: { items: ITEMS },
      slots: { default: () => '操作' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    const trigger = wrapper.find('button.ui-dropdown-menu__trigger')
    wrapper.vm.focus()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.vm.blur()
    expect(document.activeElement).not.toBe(trigger.element)
  })
})
