// api spec：props 默认值 / emits 声明 / slots 渲染 / 浮层挂载结构。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Drawer from './Drawer.vue'

/** 挂载并等 Teleport 渲染落地（isMounted 翻转在 onMounted 后的下一拍生效）。 */
async function mountDrawer(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Drawer, { props, slots: slots as never })
  await nextTick()
  return wrapper
}

/** 挂载后浮层被 Teleport 到 document.body，统一从这里查询。 */
function overlay(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-drawer')
}

describe('Drawer api', () => {
  it('关闭态：挂载后不渲染浮层（body 中无 .ui-drawer）', async () => {
    const wrapper = await mountDrawer()
    expect(overlay()).toBeNull()
    wrapper.unmount()
  })

  it('打开默认档：浮层 Teleport 到 body，根类 ui-drawer + 默认 right/md 档 + 模态（无 non-modal 修饰）', async () => {
    const wrapper = await mountDrawer({ modelValue: true })
    const root = overlay()
    expect(root).not.toBeNull()
    expect(root?.classList.contains('ui-drawer')).toBe(true)
    expect(root?.classList.contains('ui-drawer--right')).toBe(true)
    expect(root?.classList.contains('ui-drawer--md')).toBe(true)
    expect(root?.classList.contains('ui-drawer--non-modal')).toBe(false)
    wrapper.unmount()
  })

  it('side 四向修饰类落位', async () => {
    for (const side of ['left', 'right', 'top', 'bottom'] as const) {
      const wrapper = await mountDrawer({ modelValue: true, side })
      expect(overlay()?.classList.contains(`ui-drawer--${side}`)).toBe(true)
      wrapper.unmount()
    }
  })

  it('size 三档修饰类落位', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const wrapper = await mountDrawer({ modelValue: true, size })
      expect(overlay()?.classList.contains(`ui-drawer--${size}`)).toBe(true)
      wrapper.unmount()
    }
  })

  it('面板：role=dialog、aria-modal=true（模态默认）、tabindex=-1、ui-drawer__panel 类', async () => {
    const wrapper = await mountDrawer({ modelValue: true })
    const panel = document.body.querySelector<HTMLElement>('.ui-drawer__panel')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('modal=false：非模态修饰类 + 无遮罩 + 无 aria-modal', async () => {
    const wrapper = await mountDrawer({ modelValue: true, modal: false })
    const root = overlay()
    expect(root?.classList.contains('ui-drawer--non-modal')).toBe(true)
    expect(document.body.querySelector('.ui-drawer__scrim')).toBeNull()
    expect(document.body.querySelector('.ui-drawer__panel')?.getAttribute('aria-modal')).toBeNull()
    wrapper.unmount()
  })

  it('modal=true（默认）：渲染遮罩 .ui-drawer__scrim', async () => {
    const wrapper = await mountDrawer({ modelValue: true })
    expect(document.body.querySelector('.ui-drawer__scrim')).not.toBeNull()
    wrapper.unmount()
  })

  it('header 插槽渲染进 .ui-drawer__heading，且头部始终含内置关闭按钮', async () => {
    const wrapper = await mountDrawer({ modelValue: true }, { header: () => '详情侧栏' })
    expect(document.body.querySelector('.ui-drawer__heading')?.textContent).toBe('详情侧栏')
    expect(document.body.querySelector('.ui-drawer__close')).not.toBeNull()
    wrapper.unmount()
  })

  it('无 header 插槽：头部为 bare 档（仅关闭按钮，无 .ui-drawer__heading）', async () => {
    const wrapper = await mountDrawer({ modelValue: true })
    expect(document.body.querySelector('.ui-drawer__heading')).toBeNull()
    expect(document.body.querySelector('.ui-drawer__header--bare')).not.toBeNull()
    expect(document.body.querySelector('.ui-drawer__close')).not.toBeNull()
    wrapper.unmount()
  })

  it('default 插槽渲染进 .ui-drawer__body', async () => {
    const wrapper = await mountDrawer({ modelValue: true }, { default: () => '正文内容' })
    expect(document.body.querySelector('.ui-drawer__body')?.textContent).toBe('正文内容')
    wrapper.unmount()
  })

  it('footer 缺省：不渲染底部（无 .ui-drawer__footer）', async () => {
    const wrapper = await mountDrawer({ modelValue: true })
    expect(document.body.querySelector('.ui-drawer__footer')).toBeNull()
    wrapper.unmount()
  })

  it('footer 插槽：渲染进 .ui-drawer__footer', async () => {
    const wrapper = await mountDrawer({ modelValue: true }, { footer: () => '自定义动作区' })
    expect(document.body.querySelector('.ui-drawer__footer')?.textContent).toBe('自定义动作区')
    wrapper.unmount()
  })

  it('头部关闭按钮：原生 button + aria-label + aria-hidden 内联 SVG', async () => {
    const wrapper = await mountDrawer({ modelValue: true })
    const button = document.body.querySelector<HTMLButtonElement>('.ui-drawer__close')
    expect(button?.tagName).toBe('BUTTON')
    expect(button?.getAttribute('aria-label')).toBe('关闭抽屉')
    expect(button?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
})
