// behavior spec：开合（点击触发元素）、选中、外点关闭（document click capture）、定位写入等交互行为。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import DropdownMenu from './DropdownMenu.vue'
import type { DropdownMenuItem } from './DropdownMenu.types'

const ITEMS: DropdownMenuItem[] = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'lock', label: '锁定', disabled: true },
  { key: 'delete', label: '删除', danger: true },
]

/** 模拟同家族 Button 的「根 button + attrs 透传」契约（真实场景：触发器传 Button 组件）。 */
const AttrForwardButton = defineComponent({
  name: 'AttrForwardButton',
  props: { label: { type: String, required: true } },
  setup(props, { attrs }) {
    return () => h('button', { type: 'button', class: 'custom-trigger', ...attrs }, props.label)
  },
})

const wrappers: Array<{ unmount: () => void }> = []
function mountMenu(props: Record<string, unknown> = {}): VueWrapper {
  // attachTo document.body：触发器在文档内，focus()/activeElement 断言才与真实使用一致。
  // 默认插槽为单个元素 vnode：按新契约该元素直接作为触发元素（不再有内建包裹 button）。
  const wrapper = mount(DropdownMenu, {
    props: { items: ITEMS, ...props },
    slots: { default: () => h('button', { type: 'button', class: 'custom-trigger' }, '操作') },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

function triggerEl(wrapper: VueWrapper): DOMWrapper<HTMLButtonElement> {
  return wrapper.find('button.custom-trigger') as DOMWrapper<HTMLButtonElement>
}

/** 打开菜单（点击触发器）并等 Teleport 渲染与初始移焦落地。 */
async function openMenu(wrapper: VueWrapper): Promise<void> {
  await triggerEl(wrapper).trigger('click')
  await nextTick()
  await nextTick()
}

function panelEl(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-dropdown-menu__panel')
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('DropdownMenu behavior', () => {
  it('点击触发器：菜单浮层 Teleport 至 body 渲染', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    const panel = panelEl()
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('menu')
  })

  it('组件触发器（根 button 透传 attrs）：单一触发元素且点击开合（不嵌套 button）', async () => {
    const wrapper = mount(DropdownMenu, {
      props: { items: ITEMS },
      slots: { default: () => h(AttrForwardButton, { label: '操作' }) },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    // 关闭态全文档只有一个 button：插槽按钮即触发元素，无内建包裹层
    expect(document.body.querySelectorAll('button')).toHaveLength(1)
    const trigger = triggerEl(wrapper)
    await trigger.trigger('click')
    await nextTick()
    await nextTick()
    expect(panelEl()).not.toBeNull()
    await trigger.trigger('click')
    expect(panelEl()).toBeNull()
  })

  it('再次点击触发器：关闭（点击开合）', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    expect(panelEl()).not.toBeNull()
    await triggerEl(wrapper).trigger('click')
    expect(panelEl()).toBeNull()
  })

  it('点击菜单项：发出 select(key) 一次、菜单关闭、焦点还原触发器', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    const deleteItem = new DOMWrapper(
      panelEl()?.querySelectorAll<HTMLElement>('.ui-dropdown-menu__item')[3] as HTMLElement,
    )
    await deleteItem.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['delete']])
    expect(panelEl()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('点击 disabled 项：不发出 select、菜单保持打开', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    const disabledItem = new DOMWrapper(
      panelEl()?.querySelectorAll<HTMLElement>('.ui-dropdown-menu__item')[2] as HTMLElement,
    )
    await disabledItem.trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(panelEl()).not.toBeNull()
  })

  it('浮层内点击：不触发外点关闭', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    panelEl()?.dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()
    expect(panelEl()).not.toBeNull()
  })

  it('外点（浮层与触发器之外的 click）：关闭且不抢焦点', async () => {
    const outside = document.createElement('button')
    outside.textContent = '外部元素'
    document.body.appendChild(outside)
    const wrapper = mountMenu()
    await openMenu(wrapper)
    outside.dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()
    expect(panelEl()).toBeNull()
    // 外点关闭不还原焦点到触发器（焦点交还给用户点击的目标）
    expect(document.activeElement).not.toBe(triggerEl(wrapper).element)
    outside.remove()
  })

  it('打开后浮层锚盒按触发器 rect 写入 inline 定位', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    const flyout = document.body.querySelector<HTMLElement>('.ui-dropdown-menu__flyout')
    expect(flyout).not.toBeNull()
    expect(flyout?.style.left).toMatch(/px$/)
    expect(flyout?.style.top).toMatch(/px$/)
    expect(flyout?.style.width).toMatch(/px$/)
    expect(flyout?.style.height).toMatch(/px$/)
  })

  it('items 全 disabled：仍可打开，但无任何可聚焦项（tabindex 全 -1）', async () => {
    const wrapper = mountMenu({ items: [{ key: 'x', label: '禁用', disabled: true }] })
    await openMenu(wrapper)
    const items = panelEl()?.querySelectorAll<HTMLElement>('.ui-dropdown-menu__item') ?? []
    expect(items).toHaveLength(1)
    expect(items[0].tabIndex).toBe(-1)
    expect(items[0].getAttribute('aria-disabled')).toBeNull() // 使用原生 disabled，不叠加 aria-disabled
  })

  it('打开状态下卸载：全局监听被移除（后续外点不再引用已卸载实例，不抛错）', async () => {
    const wrapper = mountMenu()
    await openMenu(wrapper)
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    expect(() => outside.dispatchEvent(new Event('click', { bubbles: true }))).not.toThrow()
    outside.remove()
  })
})
