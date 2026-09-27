// a11y spec：role / aria 关联 / 键盘序列（Esc、Tab 圈定循环）/ 焦点移入与还原 / 非模态语义。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Drawer from './Drawer.vue'
import type { DrawerExpose } from './Drawer.types'

function overlayWrapper(): DOMWrapper<HTMLElement> {
  const el = document.body.querySelector<HTMLElement>('.ui-drawer')
  if (!el) throw new Error('浮层未渲染')
  return new DOMWrapper(el)
}

const wrappers: Array<{ unmount: () => void }> = []
/** 打开一个含正文输入框的抽屉：可聚焦序 = [正文 input, 头部关闭按钮]。 */
async function mountDrawer(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Drawer, {
    props: { modelValue: true, ...props },
    slots: { default: () => h('input', { type: 'text' }), ...slots } as never,
  })
  wrappers.push(wrapper)
  await nextTick() // 等 Teleport 渲染与初始焦点落地
  await nextTick()
  return wrapper
}

function focusables(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.ui-drawer__panel input, .ui-drawer__panel button'))
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('Drawer a11y', async () => {
  it('面板 role="dialog" 且模态时 aria-modal="true"', async () => {
    await mountDrawer()
    const panel = document.body.querySelector<HTMLElement>('.ui-drawer__panel')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
  })

  it('非模态：role="dialog" 保留但无 aria-modal（WAI-ARIA 非模态语义）', async () => {
    await mountDrawer({ modal: false })
    const panel = document.body.querySelector<HTMLElement>('.ui-drawer__panel')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBeNull()
  })

  it('aria-labelledby 指向 header 插槽渲染的元素 id', async () => {
    await mountDrawer({}, { header: () => '详情侧栏' })
    const panel = document.body.querySelector<HTMLElement>('.ui-drawer__panel')
    const labelledBy = panel?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const heading = document.body.querySelector<HTMLElement>(`#${labelledBy}`)
    expect(heading?.classList.contains('ui-drawer__heading')).toBe(true)
    expect(heading?.textContent).toBe('详情侧栏')
  })

  it('无 header 插槽时不出具 aria-labelledby（使用方应自行提供可访问名称来源）', async () => {
    await mountDrawer()
    expect(document.body.querySelector('.ui-drawer__panel')?.getAttribute('aria-labelledby')).toBeNull()
  })

  it('面板 tabindex="-1"：程序化聚焦锚点，不进入 Tab 序', async () => {
    await mountDrawer()
    expect(document.body.querySelector('.ui-drawer__panel')?.getAttribute('tabindex')).toBe('-1')
  })

  it('遮罩为非交互 div：无 role、无 tabindex、无键盘语义', async () => {
    await mountDrawer()
    const scrim = document.body.querySelector<HTMLElement>('.ui-drawer__scrim')
    expect(scrim).not.toBeNull()
    expect(scrim?.getAttribute('role')).toBeNull()
    expect(scrim?.getAttribute('tabindex')).toBeNull()
  })

  it('头部关闭按钮为原生 <button>（aria-label 可读，SVG 对辅助技术隐藏）', async () => {
    await mountDrawer()
    const button = document.body.querySelector('.ui-drawer__close')
    expect(button?.tagName).toBe('BUTTON')
    expect(button?.getAttribute('aria-label')).toBe('关闭抽屉')
    expect(button?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('键盘 Esc：关闭请求走键盘路径', async () => {
    const wrapper = await mountDrawer()
    await overlayWrapper().find('.ui-drawer__panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['esc']])
  })

  it('模态打开时焦点移入面板内首个可聚焦元素', async () => {
    await mountDrawer()
    const [first] = focusables()
    expect(document.activeElement).toBe(first)
  })

  it('Tab 在最后一个可聚焦元素上：圈定循环回首个', async () => {
    await mountDrawer()
    const [first, last] = focusables()
    expect(first).toBeDefined()
    expect(last).toBeDefined()
    last.focus() // 真实路径：焦点已落在最后一个可聚焦元素
    await overlayWrapper().find('.ui-drawer__close').trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })

  it('Shift+Tab 在首个可聚焦元素上：圈定循环回最后一个', async () => {
    await mountDrawer()
    const [, last] = focusables()
    await overlayWrapper().find('.ui-drawer__body input').trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('焦点逃逸到面板外时按 Tab：拉回面板内首个可聚焦元素', async () => {
    const outside = document.createElement('button')
    outside.textContent = '面板外'
    document.body.appendChild(outside)
    await mountDrawer()
    const [first] = focusables()
    outside.focus() // 模拟焦点已逃逸到面板外
    expect(document.activeElement).toBe(outside)
    await overlayWrapper().find('.ui-drawer__panel').trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    outside.remove()
  })

  it('非模态：Tab 不圈定（焦点自然流转，不拉回面板）', async () => {
    await mountDrawer({ modal: false })
    const [first, last] = focusables()
    last.focus()
    await overlayWrapper().find('.ui-drawer__close').trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(last) // 未被圈回首个
    expect(document.activeElement).not.toBe(first)
  })

  it('expose.focus()：将焦点移入面板', async () => {
    const outside = document.createElement('button')
    outside.textContent = '面板外'
    document.body.appendChild(outside)
    const wrapper = await mountDrawer()
    const exposed = wrapper.vm as DrawerExpose
    outside.focus()
    expect(document.activeElement).toBe(outside)
    exposed.focus()
    const panel = document.body.querySelector<HTMLElement>('.ui-drawer__panel')
    expect(panel?.contains(document.activeElement)).toBe(true)
    outside.remove()
  })

  it('关闭后焦点还原到打开前元素（键盘用户不丢焦点）', async () => {
    const opener = document.createElement('button')
    opener.textContent = '打开'
    document.body.appendChild(opener)
    opener.focus()
    const wrapper = await mountDrawer()
    expect(document.activeElement).not.toBe(opener)
    await wrapper.setProps({ modelValue: false })
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})
