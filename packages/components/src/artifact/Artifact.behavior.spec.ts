// behavior spec：遮罩/Esc/关闭按钮路径、copy 事件与已复制态复位、受控切换、滚动锁与焦点管理。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Artifact from './Artifact.vue'
import { ARTIFACT_COPIED_RESET_DELAY_MS } from './Artifact.constants'

function overlayWrapper(): DOMWrapper<HTMLElement> {
  const el = document.body.querySelector<HTMLElement>('.ui-artifact')
  if (!el) throw new Error('浮层未渲染')
  return new DOMWrapper(el)
}

const wrappers: Array<{ unmount: () => void }> = []
async function mountArtifact(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Artifact, {
    props: { modelValue: true, ...props },
    slots: slots as never,
  })
  wrappers.push(wrapper)
  await nextTick() // 等 Teleport 渲染落地
  return wrapper
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
  vi.useRealTimers()
})

describe('Artifact behavior', () => {
  it('点击遮罩：发出 update:modelValue false 与 close("scrim")', async () => {
    const wrapper = await mountArtifact()
    await overlayWrapper().find('.ui-artifact__scrim').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['scrim']])
  })

  it('closeOnScrim=false：点击遮罩不发出任何关闭事件', async () => {
    const wrapper = await mountArtifact({ closeOnScrim: false })
    await overlayWrapper().find('.ui-artifact__scrim').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('点击面板内部不触发遮罩关闭路径', async () => {
    const wrapper = await mountArtifact({ closeOnScrim: true })
    await overlayWrapper().find('.ui-artifact__panel').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('键盘 Esc：发出 update:modelValue false 与 close("esc")', async () => {
    const wrapper = await mountArtifact()
    await overlayWrapper().find('.ui-artifact__panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['esc']])
  })

  it('头部「关闭」IconButton：发出 update:modelValue false 与 close("action")', async () => {
    const wrapper = await mountArtifact()
    const buttons = document.body.querySelectorAll<HTMLButtonElement>('.ui-artifact__actions button')
    await new DOMWrapper(buttons[buttons.length - 1]!).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['action']])
  })

  it('modelValue true→false：v-model 受控关闭（浮层从 body 移除）', async () => {
    const wrapper = await mountArtifact()
    await wrapper.setProps({ modelValue: false })
    expect(document.body.querySelector('.ui-artifact')).toBeNull()
  })

  it('打开期间锁定 body 滚动（复用 Dialog 滚动锁：ui-dialog-scroll-lock class + overflow hidden）', async () => {
    await mountArtifact()
    expect(document.body.classList.contains('ui-dialog-scroll-lock')).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('受控关闭后解除 body 滚动锁定', async () => {
    const wrapper = await mountArtifact()
    await wrapper.setProps({ modelValue: false })
    expect(document.body.classList.contains('ui-dialog-scroll-lock')).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('打开状态下卸载：清理 body 滚动锁（onBeforeUnmount 兜底）', async () => {
    const wrapper = await mountArtifact()
    expect(document.body.classList.contains('ui-dialog-scroll-lock')).toBe(true)
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(document.body.classList.contains('ui-dialog-scroll-lock')).toBe(false)
  })

  it('copy：点击复制按钮发出 copy 载荷（正文渲染文本 + 类型）', async () => {
    const wrapper = await mountArtifact({ title: '示例' }, { default: () => 'const answer = 42' })
    const copyButton = document.body.querySelector<HTMLButtonElement>('.ui-artifact__actions button')
    await new DOMWrapper(copyButton!).trigger('click')
    expect(wrapper.emitted('copy')).toEqual([[{ text: 'const answer = 42', type: 'code' }]])
  })

  it('copy 载荷携带 markdown 类型与 language', async () => {
    const wrapper = await mountArtifact(
      { type: 'markdown', language: 'zh-CN' },
      { default: () => '# 方案标题' },
    )
    const copyButton = document.body.querySelector<HTMLButtonElement>('.ui-artifact__actions button')
    await new DOMWrapper(copyButton!).trigger('click')
    expect(wrapper.emitted('copy')).toEqual([[{ text: '# 方案标题', type: 'markdown', language: 'zh-CN' }]])
  })

  it('已复制态：aria-label 短暂切换，复位延时后还原（卸载清理定时器不报错）', async () => {
    vi.useFakeTimers()
    try {
      await mountArtifact({ title: '示例' })
      const copyButton = document.body.querySelector<HTMLButtonElement>('.ui-artifact__actions button')
      expect(copyButton?.getAttribute('aria-label')).toBe('复制代码')
      await new DOMWrapper(copyButton!).trigger('click')
      expect(copyButton?.getAttribute('aria-label')).toBe('已复制到剪贴板')
      vi.advanceTimersByTime(ARTIFACT_COPIED_RESET_DELAY_MS)
      await nextTick()
      expect(copyButton?.getAttribute('aria-label')).toBe('复制代码')
    } finally {
      vi.useRealTimers()
    }
  })

  it('打开时焦点移入面板内首个可聚焦元素（复制按钮）', async () => {
    await mountArtifact()
    await nextTick()
    const first = document.body.querySelector<HTMLElement>('.ui-artifact__actions button')
    expect(document.activeElement).toBe(first)
  })

  it('关闭后焦点还原到打开前的元素', async () => {
    const opener = document.createElement('button')
    opener.textContent = '打开画布'
    document.body.appendChild(opener)
    opener.focus()
    expect(document.activeElement).toBe(opener)

    const wrapper = await mountArtifact({}, { default: () => '正文' })
    await nextTick()
    expect(document.activeElement).not.toBe(opener) // 焦点已移入面板

    await wrapper.setProps({ modelValue: false })
    expect(document.activeElement).toBe(opener) // 焦点还原
    opener.remove()
  })
})
