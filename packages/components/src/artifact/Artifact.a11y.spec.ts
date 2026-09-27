// a11y spec：role / aria 关联 / 操作栏可访问名 / 键盘序列（Esc、Tab 圈定循环）/ 焦点移入与还原。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Artifact from './Artifact.vue'
import type { ArtifactExpose } from './Artifact.types'

function overlayWrapper(): DOMWrapper<HTMLElement> {
  const el = document.body.querySelector<HTMLElement>('.ui-artifact')
  if (!el) throw new Error('浮层未渲染')
  return new DOMWrapper(el)
}

const wrappers: Array<{ unmount: () => void }> = []
/** 打开一个默认头部的画布：可聚焦序 = [复制按钮, 关闭按钮]。 */
async function mountArtifact(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Artifact, {
    props: { modelValue: true, ...props },
    slots: slots as never,
  })
  wrappers.push(wrapper)
  await nextTick() // 等 Teleport 渲染落地
  await nextTick() // 等初始焦点落地
  return wrapper
}

function actionButtons(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.ui-artifact__actions button'))
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('Artifact a11y', () => {
  it('面板 role="dialog" 且 aria-modal="true"', async () => {
    await mountArtifact({ title: '标题' })
    const panel = document.body.querySelector<HTMLElement>('.ui-artifact__panel')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
  })

  it('aria-labelledby 指向标题元素 id（title prop）', async () => {
    await mountArtifact({ title: '排序工具函数' })
    const panel = document.body.querySelector<HTMLElement>('.ui-artifact__panel')
    const labelledBy = panel?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const title = document.body.querySelector<HTMLElement>(`#${labelledBy}`)
    expect(title?.classList.contains('ui-artifact__title')).toBe(true)
    expect(title?.textContent).toBe('排序工具函数')
  })

  it('无标题时不出具 aria-labelledby（可经 attrs aria-label 命名面板）', async () => {
    await mountArtifact()
    expect(document.body.querySelector('.ui-artifact__panel')?.getAttribute('aria-labelledby')).toBeNull()
  })

  it('attrs aria-label 透传到面板：header 插槽场景的可访问名称路径', async () => {
    await mountArtifact({ 'aria-label': '重构建议' }, { header: () => '自定义头部' })
    const panel = document.body.querySelector<HTMLElement>('.ui-artifact__panel')
    expect(panel?.getAttribute('aria-label')).toBe('重构建议')
    expect(panel?.getAttribute('aria-labelledby')).toBeNull()
  })

  it('面板 tabindex="-1"：程序化聚焦锚点，不进入 Tab 序', async () => {
    await mountArtifact()
    expect(document.body.querySelector('.ui-artifact__panel')?.getAttribute('tabindex')).toBe('-1')
  })

  it('遮罩为非交互 div：无 role、无 tabindex、无键盘语义', async () => {
    await mountArtifact()
    const scrim = document.body.querySelector<HTMLElement>('.ui-artifact__scrim')
    expect(scrim).not.toBeNull()
    expect(scrim?.getAttribute('role')).toBeNull()
    expect(scrim?.getAttribute('tabindex')).toBeNull()
  })

  it('操作栏为原生 button 且带可读 aria-label（复制/关闭）', async () => {
    await mountArtifact({ type: 'markdown' })
    const [copy, close] = actionButtons()
    expect(copy?.tagName).toBe('BUTTON')
    expect(close?.tagName).toBe('BUTTON')
    expect(copy?.getAttribute('aria-label')).toBe('复制文档')
    expect(close?.getAttribute('aria-label')).toBe('关闭')
  })

  it('键盘 Esc：关闭请求走键盘路径', async () => {
    const wrapper = await mountArtifact({ title: '标题' })
    await overlayWrapper().find('.ui-artifact__panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['esc']])
  })

  it('打开时焦点移入面板内首个可聚焦元素（复制按钮）', async () => {
    await mountArtifact()
    const [first] = actionButtons()
    expect(document.activeElement).toBe(first)
  })

  it('Tab 在最后一个可聚焦元素上：圈定循环回首个', async () => {
    await mountArtifact()
    const [first, last] = actionButtons()
    expect(first).toBeDefined()
    expect(last).toBeDefined()
    last.focus() // 真实路径：焦点已落在最后一个可聚焦元素
    await new DOMWrapper(last).trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })

  it('Shift+Tab 在首个可聚焦元素上：圈定循环回最后一个', async () => {
    await mountArtifact()
    const [first, last] = actionButtons()
    await new DOMWrapper(first).trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('焦点逃逸到面板外时按 Tab：拉回面板内首个可聚焦元素', async () => {
    const outside = document.createElement('button')
    outside.textContent = '面板外'
    document.body.appendChild(outside)
    await mountArtifact()
    const [first] = actionButtons()
    outside.focus() // 模拟焦点已逃逸到面板外
    expect(document.activeElement).toBe(outside)
    await overlayWrapper().find('.ui-artifact__panel').trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    outside.remove()
  })

  it('expose.focus()：将焦点移入面板', async () => {
    const outside = document.createElement('button')
    outside.textContent = '面板外'
    document.body.appendChild(outside)
    const wrapper = await mountArtifact()
    const exposed = wrapper.vm as ArtifactExpose
    outside.focus()
    expect(document.activeElement).toBe(outside)
    exposed.focus()
    const panel = document.body.querySelector<HTMLElement>('.ui-artifact__panel')
    expect(panel?.contains(document.activeElement)).toBe(true)
    outside.remove()
  })

  it('关闭后焦点还原到打开前元素（键盘用户不丢焦点）', async () => {
    const opener = document.createElement('button')
    opener.textContent = '打开'
    document.body.appendChild(opener)
    opener.focus()
    const wrapper = await mountArtifact()
    expect(document.activeElement).not.toBe(opener)
    await wrapper.setProps({ modelValue: false })
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})
