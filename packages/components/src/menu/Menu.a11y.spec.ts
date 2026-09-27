// a11y spec：nav 地标与列表语义 / aria-current / roving tabindex / aria-expanded 链 / 键盘序列。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Menu from './Menu.vue'
import MenuItem from './MenuItem.vue'
import SubMenu from './SubMenu.vue'

/** 标准组合（甲 / 分组(甲一/甲二) / 乙）。 */
function mountMenu(attach = false) {
  return mount(Menu, {
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
    ...(attach ? { attachTo: document.body } : {}),
  })
}

/** 按文本查找叶子项按钮。 */
function buttonByText(wrapper: ReturnType<typeof mount>, text: string) {
  const found = wrapper.findAll('button').find(b => b.text() === text)
  if (found == null) throw new Error(`button not found: ${text}`)
  return found
}

/** 在元素上派发可取消键盘事件，返回该事件（断言 defaultPrevented）。 */
function dispatchKey(element: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  element.dispatchEvent(event)
  return event
}

describe('Menu a11y', () => {
  it('nav 地标 + 原生列表语义：nav > ul > li > button 层级', () => {
    const wrapper = mountMenu()
    expect(wrapper.element.tagName).toBe('NAV')
    const list = wrapper.find('ul.ui-menu-list')
    expect(list.exists()).toBe(true)
    const buttons = wrapper.findAll('button')
    for (const button of buttons) {
      expect(button.element.closest('li')).not.toBeNull()
      expect(button.element.closest('ul')).not.toBeNull()
    }
  })

  it('aria-current="page" 仅落在激活项，切换后随 DOM 更新', async () => {
    const wrapper = mountMenu()
    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(0)
    await buttonByText(wrapper, '乙').trigger('click')
    const currents = wrapper.findAll('[aria-current="page"]')
    expect(currents).toHaveLength(1)
    expect(currents[0].text()).toBe('乙')
    expect(buttonByText(wrapper, '甲').attributes('aria-current')).toBeUndefined()
  })

  it('roving tabindex：首个可见可用项留在 Tab 序（无激活值时），其余 -1', () => {
    const wrapper = mountMenu()
    // 无激活值：首个可见可用项（甲）持有 Tab 序；收起组内项不在可见池
    expect(buttonByText(wrapper, '甲').attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('.ui-menu-submenu__trigger').attributes('tabindex')).toBe('-1')
    expect(buttonByText(wrapper, '乙').attributes('tabindex')).toBe('-1')
  })

  it('roving tabindex：激活后 tabindex 跟随激活项', async () => {
    const wrapper = mountMenu()
    await buttonByText(wrapper, '乙').trigger('click')
    expect(buttonByText(wrapper, '乙').attributes('tabindex')).toBeUndefined()
    expect(buttonByText(wrapper, '甲').attributes('tabindex')).toBe('-1')
  })

  it('roving tabindex：收起组的子项移出 Tab 序（-1），展开后进入导航池', async () => {
    const wrapper = mountMenu()
    expect(buttonByText(wrapper, '甲一').attributes('tabindex')).toBe('-1')
    await wrapper.find('.ui-menu-submenu__trigger').trigger('click')
    // 展开后无激活值：首个可见可用项（甲）持有 Tab 序
    expect(buttonByText(wrapper, '甲').attributes('tabindex')).toBeUndefined()
    expect(buttonByText(wrapper, '甲一').attributes('tabindex')).toBe('-1')
  })

  it('键盘 Enter / Space：激活当前项（keydown preventDefault，单次触发）', async () => {
    for (const key of ['Enter', ' ']) {
      const wrapper = mountMenu()
      await buttonByText(wrapper, '乙').trigger('keydown', { key })
      expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
      expect(wrapper.emitted('select')).toEqual([['b']])
      expect(wrapper.findAll('[aria-current="page"]')[0].text()).toBe('乙')
      wrapper.unmount()
    }
  })

  it('组触发器 Enter：切换展开（aria-expanded），不发出 select', async () => {
    const wrapper = mountMenu()
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('select')).toBeUndefined()
    await trigger.trigger('keydown', { key: ' ' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('aria-expanded / aria-controls / aria-labelledby 链：id 确定性且互指', async () => {
    const wrapper = mountMenu()
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    const panel = wrapper.find('.ui-menu-submenu__panel')
    const controls = trigger.attributes('aria-controls')
    expect(controls).toBeDefined()
    expect(panel.attributes('id')).toBe(controls)
    expect(panel.attributes('aria-labelledby')).toBe(trigger.attributes('id'))
    const idBefore = { trigger: trigger.attributes('id'), panel: panel.attributes('id') }
    await trigger.trigger('click')
    expect(wrapper.find('.ui-menu-submenu__trigger').attributes('id')).toBe(idBefore.trigger)
    expect(wrapper.find('.ui-menu-submenu__panel').attributes('id')).toBe(idBefore.panel)
  })

  it('收起组面板存在于 DOM 但以 display:none 隐藏（v-show），展开后内联样式解除', async () => {
    const wrapper = mountMenu()
    const panel = wrapper.find('.ui-menu-submenu__panel')
    expect(panel.exists()).toBe(true)
    // happy-dom 的 getComputedStyle 不回读内联样式，isVisible 不可靠；断言 v-show 的内联 display
    expect(panel.attributes('style')).toContain('display: none')
    await wrapper.find('.ui-menu-submenu__trigger').trigger('click')
    expect(wrapper.find('.ui-menu-submenu__panel').attributes('style')).toBeUndefined()
  })

  it('方向键 keydown 被 preventDefault（防滚动），非导航键不拦截', () => {
    const wrapper = mountMenu()
    const first = buttonByText(wrapper, '甲').element
    for (const key of ['ArrowRight', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'Home', 'End']) {
      const nav = dispatchKey(first, key)
      expect(nav.defaultPrevented, key).toBe(true)
    }
    const other = dispatchKey(first, 'x')
    expect(other.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('Esc：子菜单内被 preventDefault 并收起回焦；根层项（无所属子菜单）不拦截', async () => {
    const wrapper = mountMenu(true)
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    await trigger.trigger('click')
    const child = buttonByText(wrapper, '甲一')
    const inside = dispatchKey(child.element, 'Escape')
    expect(inside.defaultPrevented).toBe(true)
    // 原生派发不经过 Vue 调度：等待响应式 DOM 刷新后再断言展开态
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)

    const rootItem = buttonByText(wrapper, '甲')
    const outside = dispatchKey(rootItem.element, 'Escape')
    expect(outside.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('ArrowDown 移动焦点至下一可见可用项（焦点跟随），↑↓ 均可用', async () => {
    const wrapper = mountMenu(true)
    await buttonByText(wrapper, '甲').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(wrapper.find('.ui-menu-submenu__trigger').element)
    await wrapper.find('.ui-menu-submenu__trigger').trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '甲').element)
    wrapper.unmount()
  })
})
