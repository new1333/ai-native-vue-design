// a11y spec：role / aria 关联 / 键盘序列（打开、roving focus、选中、Esc/Tab 关闭与焦点还原）。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import DropdownMenu from './DropdownMenu.vue'
import type { DropdownMenuItem } from './DropdownMenu.types'

/** 启用项序 = [0 编辑, 1 复制, 3 删除]；2 为 disabled（箭头必须跳过）。 */
const ITEMS: DropdownMenuItem[] = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'lock', label: '锁定', disabled: true },
  { key: 'delete', label: '删除', danger: true },
]

const wrappers: Array<{ unmount: () => void }> = []
function mountMenu(props: Record<string, unknown> = {}): VueWrapper {
  // attachTo document.body：触发器在文档内，focus()/activeElement 断言才与真实使用一致
  const wrapper = mount(DropdownMenu, {
    props: { items: ITEMS, ...props },
    slots: { default: () => h('span', '操作') },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

function trigger(wrapper: VueWrapper): DOMWrapper<HTMLButtonElement> {
  return wrapper.find('button.ui-dropdown-menu__trigger') as DOMWrapper<HTMLButtonElement>
}

/** 以触发器 keydown 打开（position 决定初始焦点），并等渲染/移焦落地。 */
async function openWithKey(
  wrapper: VueWrapper,
  key: 'ArrowDown' | 'ArrowUp' | 'Enter',
): Promise<void> {
  await trigger(wrapper).trigger('keydown', { key })
  await nextTick()
  await nextTick()
}

/** body 中全部 menuitem 元素（DOM 序 = items 序）。 */
function items(): HTMLElement[] {
  return Array.from(
    document.body.querySelectorAll<HTMLElement>('.ui-dropdown-menu__panel [role="menuitem"]'),
  )
}

function focusedItem(): HTMLElement | null {
  return document.activeElement instanceof HTMLElement &&
    document.activeElement.closest('.ui-dropdown-menu__panel') !== null
    ? document.activeElement
    : null
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('DropdownMenu a11y', () => {
  it('触发器为原生 button：aria-haspopup="menu"，aria-expanded 随开合切换', async () => {
    const wrapper = mountMenu()
    expect(trigger(wrapper).attributes('aria-haspopup')).toBe('menu')
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')
    await openWithKey(wrapper, 'ArrowDown')
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
    await trigger(wrapper).trigger('keydown', { key: 'Escape' })
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')
  })

  it('打开时 aria-controls 指向菜单元素 id，面板 role="menu" 且 aria-labelledby 指向触发器 id', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    const controls = trigger(wrapper).attributes('aria-controls')
    expect(controls).toBeTruthy()
    const menu = document.body.querySelector<HTMLElement>('#' + controls)
    expect(menu?.getAttribute('role')).toBe('menu')
    expect(menu?.classList.contains('ui-dropdown-menu__panel')).toBe(true)
    const labelledBy = menu?.getAttribute('aria-labelledby')
    expect(labelledBy).toBe(trigger(wrapper).attributes('id'))
  })

  it('菜单项为原生 button 且 role="menuitem"', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    const elements = items()
    expect(elements).toHaveLength(4)
    for (const element of elements) {
      expect(element.tagName).toBe('BUTTON')
      expect(element.getAttribute('role')).toBe('menuitem')
    }
  })

  it('触发器 ↓：打开并把焦点移到首个启用项', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    expect(focusedItem()).toBe(items()[0])
  })

  it('触发器 ↑：打开并把焦点移到最后一个启用项（跳过 disabled）', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowUp')
    expect(focusedItem()).toBe(items()[3])
  })

  it('触发器 Enter：打开并把焦点移到首个启用项', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'Enter')
    expect(focusedItem()).toBe(items()[0])
  })

  it('菜单内 ↓：移到下一个启用项（跳过 disabled）', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    await new DOMWrapper(items()[0]).trigger('keydown', { key: 'ArrowDown' })
    expect(focusedItem()).toBe(items()[1])
    await new DOMWrapper(items()[1]).trigger('keydown', { key: 'ArrowDown' })
    expect(focusedItem()).toBe(items()[3]) // 跳过 disabled 的「锁定」
  })

  it('菜单内 ↓ 在最后一个启用项上：环绕回首项', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowUp')
    await new DOMWrapper(items()[3]).trigger('keydown', { key: 'ArrowDown' })
    expect(focusedItem()).toBe(items()[0])
  })

  it('菜单内 ↑ 在首个启用项上：环绕回最后一个启用项；↑ 常规步进亦成立', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    await new DOMWrapper(items()[0]).trigger('keydown', { key: 'ArrowUp' })
    expect(focusedItem()).toBe(items()[3])
    await new DOMWrapper(items()[3]).trigger('keydown', { key: 'ArrowUp' })
    expect(focusedItem()).toBe(items()[1]) // 反向同样跳过 disabled
  })

  it('Home / End：焦点移到首个 / 最后一个启用项', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    await new DOMWrapper(items()[0]).trigger('keydown', { key: 'End' })
    expect(focusedItem()).toBe(items()[3])
    await new DOMWrapper(items()[3]).trigger('keydown', { key: 'Home' })
    expect(focusedItem()).toBe(items()[0])
  })

  it('菜单内 Enter：选中当前项并关闭、焦点还原触发器', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    await new DOMWrapper(items()[0]).trigger('keydown', { key: 'ArrowDown' })
    await new DOMWrapper(items()[1]).trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([['copy']])
    expect(document.body.querySelector('.ui-dropdown-menu__panel')).toBeNull()
    expect(document.activeElement).toBe(trigger(wrapper).element)
  })

  it('Esc：关闭并还原焦点到触发器', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    await new DOMWrapper(items()[0]).trigger('keydown', { key: 'Escape' })
    expect(document.body.querySelector('.ui-dropdown-menu__panel')).toBeNull()
    expect(document.activeElement).toBe(trigger(wrapper).element)
  })

  it('Tab：关闭并还原焦点到触发器（不放行焦点离开浮层）', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    await new DOMWrapper(items()[0]).trigger('keydown', { key: 'Tab' })
    expect(document.body.querySelector('.ui-dropdown-menu__panel')).toBeNull()
    expect(document.activeElement).toBe(trigger(wrapper).element)
  })

  it('roving tabindex：当前聚焦项为 0、其余为 -1，disabled 项恒 -1', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown')
    const initial = items()
    expect(initial.map(element => element.tabIndex)).toEqual([0, -1, -1, -1])
    await new DOMWrapper(initial[0]).trigger('keydown', { key: 'ArrowDown' })
    expect(initial.map(element => element.tabIndex)).toEqual([-1, 0, -1, -1])
  })

  it('disabled 项不可聚焦：DOM 焦点从不落在其上（箭头跳过、环绕亦不驻留）', async () => {
    const wrapper = mountMenu()
    await openWithKey(wrapper, 'ArrowDown') // 焦点 [0]
    await new DOMWrapper(items()[0]).trigger('keydown', { key: 'ArrowDown' }) // → [1]
    await new DOMWrapper(items()[1]).trigger('keydown', { key: 'ArrowDown' }) // → [3]，跳过 [2]
    await new DOMWrapper(items()[3]).trigger('keydown', { key: 'ArrowDown' }) // 环绕 → [0]
    expect(focusedItem()).toBe(items()[0])
    expect(document.activeElement).not.toBe(items()[2])
  })
})
