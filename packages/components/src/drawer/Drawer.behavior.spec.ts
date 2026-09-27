// behavior spec：遮罩/Esc/关闭按钮三条关闭路径、受控状态切换、模态滚动锁与焦点管理、非模态共存行为。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Drawer from './Drawer.vue'

function overlayWrapper(): DOMWrapper<HTMLElement> {
  const el = document.body.querySelector<HTMLElement>('.ui-drawer')
  if (!el) throw new Error('浮层未渲染')
  return new DOMWrapper(el)
}

const wrappers: Array<{ unmount: () => void }> = []
async function mountDrawer(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Drawer, {
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

describe('Drawer behavior', () => {
  it('点击遮罩：发出 update:modelValue false 与 close("scrim")', async () => {
    const wrapper = await mountDrawer()
    await overlayWrapper().find('.ui-drawer__scrim').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['scrim']])
  })

  it('closeOnScrim=false：点击遮罩不发出任何关闭事件', async () => {
    const wrapper = await mountDrawer({ closeOnScrim: false })
    await overlayWrapper().find('.ui-drawer__scrim').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('点击面板内部不触发遮罩关闭路径', async () => {
    const wrapper = await mountDrawer({ closeOnScrim: true })
    await overlayWrapper().find('.ui-drawer__panel').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('键盘 Esc：发出 update:modelValue false 与 close("esc")', async () => {
    const wrapper = await mountDrawer()
    await overlayWrapper().find('.ui-drawer__panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['esc']])
  })

  it('非模态同样支持 Esc 关闭（焦点在面板内）', async () => {
    const wrapper = await mountDrawer({ modal: false })
    await overlayWrapper().find('.ui-drawer__panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['esc']])
  })

  it('头部关闭按钮点击：发出 update:modelValue false 与 close("close-button")', async () => {
    const wrapper = await mountDrawer()
    await overlayWrapper().find('.ui-drawer__close').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['close-button']])
  })

  it('modelValue true→false：v-model 受控关闭（浮层从 body 移除）', async () => {
    const wrapper = await mountDrawer()
    await wrapper.setProps({ modelValue: false })
    expect(document.body.querySelector('.ui-drawer')).toBeNull()
  })

  it('模态打开期间锁定 body 滚动（挂 ui-drawer-scroll-lock class + overflow hidden）', async () => {
    await mountDrawer()
    expect(document.body.classList.contains('ui-drawer-scroll-lock')).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('受控关闭后解除 body 滚动锁定', async () => {
    const wrapper = await mountDrawer()
    await wrapper.setProps({ modelValue: false })
    expect(document.body.classList.contains('ui-drawer-scroll-lock')).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('非模态打开：不锁定 body 滚动', async () => {
    await mountDrawer({ modal: false })
    expect(document.body.classList.contains('ui-drawer-scroll-lock')).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('打开状态下卸载：清理 body 滚动锁（onBeforeUnmount 兜底）', async () => {
    const wrapper = await mountDrawer()
    expect(document.body.classList.contains('ui-drawer-scroll-lock')).toBe(true)
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(document.body.classList.contains('ui-drawer-scroll-lock')).toBe(false)
  })

  it('模态打开时焦点移入面板内首个可聚焦元素', async () => {
    await mountDrawer({}, { default: () => '正文' })
    await nextTick()
    const panel = document.body.querySelector<HTMLElement>('.ui-drawer__panel')
    const active = document.activeElement
    expect(active).not.toBeNull()
    expect(panel?.contains(active)).toBe(true)
  })

  it('非模态打开：不移入焦点（页面焦点保持原位）', async () => {
    const opener = document.createElement('button')
    opener.textContent = '打开抽屉'
    document.body.appendChild(opener)
    opener.focus()
    await mountDrawer({ modal: false })
    await nextTick()
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })

  it('模态关闭后焦点还原到打开前的元素', async () => {
    const opener = document.createElement('button')
    opener.textContent = '打开抽屉'
    document.body.appendChild(opener)
    opener.focus()
    expect(document.activeElement).toBe(opener)

    const wrapper = await mountDrawer({}, { default: () => '正文' })
    await nextTick()
    expect(document.activeElement).not.toBe(opener) // 焦点已移入面板

    await wrapper.setProps({ modelValue: false })
    expect(document.activeElement).toBe(opener) // 焦点还原
    opener.remove()
  })
})
