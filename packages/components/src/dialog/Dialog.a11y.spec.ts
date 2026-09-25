// a11y spec：role / aria 关联 / 键盘序列（Esc、Tab 圈定循环）/ 焦点移入与还原。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Dialog from './Dialog.vue'
import type { DialogExpose } from './Dialog.types'

function overlayWrapper(): DOMWrapper<HTMLElement> {
  const el = document.body.querySelector<HTMLElement>('.ui-dialog')
  if (!el) throw new Error('浮层未渲染')
  return new DOMWrapper(el)
}

const wrappers: Array<{ unmount: () => void }> = []
/** 打开一个含正文输入框的对话框：可聚焦序 = [正文 input, footer 默认关闭按钮]。 */
async function mountDialog(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Dialog, {
    props: { modelValue: true, ...props },
    slots: { default: () => h('input', { type: 'text' }), ...slots } as never,
  })
  wrappers.push(wrapper)
  await nextTick() // 等 Teleport 渲染与初始焦点落地
  await nextTick()
  return wrapper
}

function focusables(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.ui-dialog__panel input, .ui-dialog__panel button'))
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('Dialog a11y', async () => {
  it('面板 role="dialog" 且 aria-modal="true"', async () => {
    await mountDialog({ title: '标题' })
    const panel = document.body.querySelector<HTMLElement>('.ui-dialog__panel')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
  })

  it('aria-labelledby 指向标题元素 id（title prop）', async () => {
    await mountDialog({ title: 'prop 标题' })
    const panel = document.body.querySelector<HTMLElement>('.ui-dialog__panel')
    const labelledBy = panel?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const title = document.body.querySelector<HTMLElement>(`#${labelledBy}`)
    expect(title?.classList.contains('ui-dialog__title')).toBe(true)
    expect(title?.textContent).toBe('prop 标题')
  })

  it('aria-labelledby 指向标题元素 id（title 插槽同样成立）', async () => {
    await mountDialog({}, { title: () => '插槽标题' })
    const panel = document.body.querySelector<HTMLElement>('.ui-dialog__panel')
    const labelledBy = panel?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(document.body.querySelector<HTMLElement>(`#${labelledBy}`)?.textContent).toBe('插槽标题')
  })

  it('无标题时不出具 aria-labelledby（使用方应自行提供可访问名称来源）', async () => {
    await mountDialog()
    expect(document.body.querySelector('.ui-dialog__panel')?.getAttribute('aria-labelledby')).toBeNull()
  })

  it('面板 tabindex="-1"：程序化聚焦锚点，不进入 Tab 序', async () => {
    await mountDialog()
    expect(document.body.querySelector('.ui-dialog__panel')?.getAttribute('tabindex')).toBe('-1')
  })

  it('遮罩为非交互 div：无 role、无 tabindex、无键盘语义', async () => {
    await mountDialog()
    const scrim = document.body.querySelector<HTMLElement>('.ui-dialog__scrim')
    expect(scrim).not.toBeNull()
    expect(scrim?.getAttribute('role')).toBeNull()
    expect(scrim?.getAttribute('tabindex')).toBeNull()
  })

  it('默认关闭按钮为原生 <button>（含可读文本）', async () => {
    await mountDialog()
    const button = document.body.querySelector('.ui-dialog__footer button.ui-button')
    expect(button?.tagName).toBe('BUTTON')
    expect(button?.textContent).toBe('关闭')
  })

  it('键盘 Esc：关闭请求走键盘路径', async () => {
    const wrapper = await mountDialog({ title: '标题' })
    await overlayWrapper().find('.ui-dialog__panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['esc']])
  })

  it('打开时焦点移入面板内首个可聚焦元素', async () => {
    await mountDialog()
    await nextTick()
    const [first] = focusables()
    expect(document.activeElement).toBe(first)
  })

  it('Tab 在最后一个可聚焦元素上：圈定循环回首个', async () => {
    await mountDialog()
    await nextTick()
    const [first, last] = focusables()
    expect(first).toBeDefined()
    expect(last).toBeDefined()
    last.focus() // 真实路径：焦点已落在最后一个可聚焦元素
    await overlayWrapper().find('.ui-dialog__footer button.ui-button').trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })

  it('Shift+Tab 在首个可聚焦元素上：圈定循环回最后一个', async () => {
    await mountDialog()
    await nextTick()
    const [, last] = focusables()
    await overlayWrapper().find('.ui-dialog__body input').trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('焦点逃逸到面板外时按 Tab：拉回面板内首个可聚焦元素', async () => {
    const outside = document.createElement('button')
    outside.textContent = '面板外'
    document.body.appendChild(outside)
    await mountDialog()
    await nextTick()
    const [first] = focusables()
    outside.focus() // 模拟焦点已逃逸到面板外
    expect(document.activeElement).toBe(outside)
    await overlayWrapper().find('.ui-dialog__panel').trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    outside.remove()
  })

  it('expose.focus()：将焦点移入面板', async () => {
    const outside = document.createElement('button')
    outside.textContent = '面板外'
    document.body.appendChild(outside)
    const wrapper = await mountDialog()
    const exposed = wrapper.vm as DialogExpose
    await nextTick()
    outside.focus()
    expect(document.activeElement).toBe(outside)
    exposed.focus()
    const panel = document.body.querySelector<HTMLElement>('.ui-dialog__panel')
    expect(panel?.contains(document.activeElement)).toBe(true)
    outside.remove()
  })

  it('关闭后焦点还原到打开前元素（键盘用户不丢焦点）', async () => {
    const opener = document.createElement('button')
    opener.textContent = '打开'
    document.body.appendChild(opener)
    opener.focus()
    const wrapper = await mountDialog()
    await nextTick()
    expect(document.activeElement).not.toBe(opener)
    await wrapper.setProps({ modelValue: false })
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})
