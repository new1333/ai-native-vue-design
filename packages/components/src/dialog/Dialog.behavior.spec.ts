// behavior spec：遮罩/Esc/footer 关闭路径、受控状态切换、滚动锁与焦点管理行为。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Dialog from './Dialog.vue'

function overlayWrapper(): DOMWrapper<HTMLElement> {
  const el = document.body.querySelector<HTMLElement>('.ui-dialog')
  if (!el) throw new Error('浮层未渲染')
  return new DOMWrapper(el)
}

const wrappers: Array<{ unmount: () => void }> = []
async function mountDialog(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Dialog, {
    props: { modelValue: true, ...props },
    slots: slots as never,
  })
  wrappers.push(wrapper)
  await nextTick() // 等 Teleport 渲染落地
  return wrapper
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('Dialog behavior', () => {
  it('点击遮罩：发出 update:modelValue false 与 close("scrim")', async () => {
    const wrapper = await mountDialog()
    await overlayWrapper().find('.ui-dialog__scrim').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['scrim']])
  })

  it('closeOnScrim=false：点击遮罩不发出任何关闭事件', async () => {
    const wrapper = await mountDialog({ closeOnScrim: false })
    await overlayWrapper().find('.ui-dialog__scrim').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('点击面板内部不触发遮罩关闭路径', async () => {
    const wrapper = await mountDialog({ closeOnScrim: true })
    await overlayWrapper().find('.ui-dialog__panel').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('键盘 Esc：发出 update:modelValue false 与 close("esc")', async () => {
    const wrapper = await mountDialog()
    await overlayWrapper().find('.ui-dialog__panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['esc']])
  })

  it('默认关闭按钮点击：发出 update:modelValue false 与 close("footer")', async () => {
    const wrapper = await mountDialog()
    await overlayWrapper().find('.ui-dialog__footer button.ui-button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['footer']])
  })

  it('footer 自定义插槽时不渲染默认关闭按钮，也不自动关闭', async () => {
    const wrapper = await mountDialog({}, { footer: () => '仅展示区' })
    expect(document.body.querySelector('.ui-dialog__footer button.ui-button')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('modelValue true→false：v-model 受控关闭（浮层从 body 移除）', async () => {
    const wrapper = await mountDialog()
    await wrapper.setProps({ modelValue: false })
    expect(document.body.querySelector('.ui-dialog')).toBeNull()
  })

  it('打开期间锁定 body 滚动（挂 ui-dialog-scroll-lock class + overflow hidden）', async () => {
    await mountDialog()
    expect(document.body.classList.contains('ui-dialog-scroll-lock')).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('受控关闭后解除 body 滚动锁定', async () => {
    const wrapper = await mountDialog()
    await wrapper.setProps({ modelValue: false })
    expect(document.body.classList.contains('ui-dialog-scroll-lock')).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('打开状态下卸载：清理 body 滚动锁（onBeforeUnmount 兜底）', async () => {
    const wrapper = await mountDialog()
    expect(document.body.classList.contains('ui-dialog-scroll-lock')).toBe(true)
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(document.body.classList.contains('ui-dialog-scroll-lock')).toBe(false)
  })

  it('打开时焦点移入面板内首个可聚焦元素', async () => {
    await mountDialog({}, { default: () => '正文' })
    await nextTick()
    const panel = document.body.querySelector<HTMLElement>('.ui-dialog__panel')
    const active = document.activeElement
    expect(active).not.toBeNull()
    expect(panel?.contains(active)).toBe(true)
  })

  it('关闭后焦点还原到打开前的元素', async () => {
    const opener = document.createElement('button')
    opener.textContent = '打开对话框'
    document.body.appendChild(opener)
    opener.focus()
    expect(document.activeElement).toBe(opener)

    const wrapper = await mountDialog({}, { default: () => '正文' })
    await nextTick()
    expect(document.activeElement).not.toBe(opener) // 焦点已移入面板

    await wrapper.setProps({ modelValue: false })
    expect(document.activeElement).toBe(opener) // 焦点还原
    opener.remove()
  })
})
