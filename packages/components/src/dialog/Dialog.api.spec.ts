// api spec：props 默认值 / emits 声明 / slots 渲染 / 浮层挂载结构。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Dialog from './Dialog.vue'

/** 挂载并等 Teleport 渲染落地（isMounted 翻转在 onMounted 后的下一拍生效）。 */
async function mountDialog(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Dialog, { props, slots: slots as never })
  await nextTick()
  return wrapper
}

/** 挂载后浮层被 Teleport 到 document.body，统一从这里查询。 */
function overlay(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-dialog')
}

describe('Dialog api', () => {
  it('关闭态：挂载后不渲染浮层（body 中无 .ui-dialog）', async () => {
    const wrapper = await mountDialog()
    expect(overlay()).toBeNull()
    wrapper.unmount()
  })

  it('打开默认档：浮层 Teleport 到 body，根类 ui-dialog + ui-dialog--md', async () => {
    const wrapper = await mountDialog({ modelValue: true })
    const root = overlay()
    expect(root).not.toBeNull()
    expect(root?.classList.contains('ui-dialog')).toBe(true)
    expect(root?.classList.contains('ui-dialog--md')).toBe(true)
    wrapper.unmount()
  })

  it('size 三档修饰类落位', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const wrapper = await mountDialog({ modelValue: true, size })
      expect(overlay()?.classList.contains(`ui-dialog--${size}`)).toBe(true)
      wrapper.unmount()
    }
  })

  it('面板：role=dialog、aria-modal=true、tabindex=-1、ui-dialog__panel 类', async () => {
    const wrapper = await mountDialog({ modelValue: true, title: '标题' })
    const panel = document.body.querySelector<HTMLElement>('.ui-dialog__panel')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('title prop：渲染 .ui-dialog__title 文本', async () => {
    const wrapper = await mountDialog({ modelValue: true, title: '删除确认' })
    expect(document.body.querySelector('.ui-dialog__title')?.textContent).toBe('删除确认')
    wrapper.unmount()
  })

  it('title 插槽覆盖 prop 文本', async () => {
    const wrapper = await mountDialog({ modelValue: true, title: 'prop 标题' }, { title: () => '插槽标题' })
    expect(document.body.querySelector('.ui-dialog__title')?.textContent).toBe('插槽标题')
    wrapper.unmount()
  })

  it('无 title prop 且无插槽：不渲染头部（无 .ui-dialog__header）', async () => {
    const wrapper = await mountDialog({ modelValue: true })
    expect(document.body.querySelector('.ui-dialog__header')).toBeNull()
    wrapper.unmount()
  })

  it('default 插槽渲染进 .ui-dialog__body', async () => {
    const wrapper = await mountDialog({ modelValue: true }, { default: () => '正文内容' })
    expect(document.body.querySelector('.ui-dialog__body')?.textContent).toBe('正文内容')
    wrapper.unmount()
  })

  it('footer 缺省：渲染本库 Button 的默认「关闭」按钮', async () => {
    const wrapper = await mountDialog({ modelValue: true })
    const button = document.body.querySelector<HTMLButtonElement>('.ui-dialog__footer button.ui-button')
    expect(button).not.toBeNull()
    expect(button?.textContent).toBe('关闭')
    wrapper.unmount()
  })

  it('footer 插槽：整体替换默认关闭按钮', async () => {
    const wrapper = await mountDialog({ modelValue: true }, { footer: () => '自定义动作区' })
    const footer = document.body.querySelector('.ui-dialog__footer')
    expect(footer?.textContent).toBe('自定义动作区')
    expect(footer?.querySelector('button.ui-button')).toBeNull()
    wrapper.unmount()
  })
})
