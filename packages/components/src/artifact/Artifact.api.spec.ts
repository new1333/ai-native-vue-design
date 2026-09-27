// api spec：props 默认值 / 浮层挂载结构 / slots 渲染 / attrs 透传落点。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Artifact from './Artifact.vue'

/** 挂载并等 Teleport 渲染落地（isMounted 翻转在 onMounted 后的下一拍生效）。 */
async function mountArtifact(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const wrapper = mount(Artifact, { props, slots: slots as never })
  await nextTick()
  return wrapper
}

/** 挂载后浮层被 Teleport 到 document.body，统一从这里查询。 */
function overlay(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-artifact')
}

describe('Artifact api', () => {
  it('关闭态：挂载后不渲染浮层（body 中无 .ui-artifact）', async () => {
    const wrapper = await mountArtifact()
    expect(overlay()).toBeNull()
    wrapper.unmount()
  })

  it('打开默认档：浮层 Teleport 到 body，根类 ui-artifact + 默认 ui-artifact--code', async () => {
    const wrapper = await mountArtifact({ modelValue: true })
    const root = overlay()
    expect(root).not.toBeNull()
    expect(root?.classList.contains('ui-artifact')).toBe(true)
    expect(root?.classList.contains('ui-artifact--code')).toBe(true)
    wrapper.unmount()
  })

  it('type 修饰类：markdown 档落位 ui-artifact--markdown', async () => {
    const wrapper = await mountArtifact({ modelValue: true, type: 'markdown' })
    expect(overlay()?.classList.contains('ui-artifact--markdown')).toBe(true)
    wrapper.unmount()
  })

  it('面板：role=dialog、aria-modal=true、tabindex=-1、ui-artifact__panel 类', async () => {
    const wrapper = await mountArtifact({ modelValue: true, title: '标题' })
    const panel = document.body.querySelector<HTMLElement>('.ui-artifact__panel')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('title prop：渲染 .ui-artifact__title 文本', async () => {
    const wrapper = await mountArtifact({ modelValue: true, title: '排序工具函数' })
    expect(document.body.querySelector('.ui-artifact__title')?.textContent).toBe('排序工具函数')
    wrapper.unmount()
  })

  it('默认徽标：无 language 时回落类型名（code → 代码）', async () => {
    const wrapper = await mountArtifact({ modelValue: true })
    expect(document.body.querySelector('.ui-artifact__badge')?.textContent).toBe('代码')
    wrapper.unmount()
  })

  it('language prop：徽标显示语言名', async () => {
    const wrapper = await mountArtifact({ modelValue: true, language: 'TypeScript' })
    expect(document.body.querySelector('.ui-artifact__badge')?.textContent).toBe('TypeScript')
    wrapper.unmount()
  })

  it('type=markdown：徽标回落「文档」', async () => {
    const wrapper = await mountArtifact({ modelValue: true, type: 'markdown' })
    expect(document.body.querySelector('.ui-artifact__badge')?.textContent).toBe('文档')
    wrapper.unmount()
  })

  it('默认头部操作栏：复制/关闭两个原生按钮，aria-label 齐备', async () => {
    const wrapper = await mountArtifact({ modelValue: true })
    const buttons = document.body.querySelectorAll<HTMLElement>('.ui-artifact__actions button')
    expect(buttons.length).toBe(2)
    expect(buttons[0]?.getAttribute('aria-label')).toBe('复制代码')
    expect(buttons[1]?.getAttribute('aria-label')).toBe('关闭')
    wrapper.unmount()
  })

  it('header 插槽：整体替换默认头部（有 title prop 也不渲染默认标题/徽标/操作栏）', async () => {
    const wrapper = await mountArtifact({ modelValue: true, title: 'prop 标题' }, { header: () => '自定义头部' })
    const header = document.body.querySelector('.ui-artifact__header')
    expect(header?.textContent).toBe('自定义头部')
    expect(document.body.querySelector('.ui-artifact__title')).toBeNull()
    expect(document.body.querySelector('.ui-artifact__badge')).toBeNull()
    expect(document.body.querySelector('.ui-artifact__actions')).toBeNull()
    wrapper.unmount()
  })

  it('default 插槽渲染进 .ui-artifact__body', async () => {
    const wrapper = await mountArtifact({ modelValue: true }, { default: () => '正文内容' })
    expect(document.body.querySelector('.ui-artifact__body')?.textContent).toBe('正文内容')
    wrapper.unmount()
  })

  it('footer 缺省：不渲染底部（无 .ui-artifact__footer）', async () => {
    const wrapper = await mountArtifact({ modelValue: true })
    expect(document.body.querySelector('.ui-artifact__footer')).toBeNull()
    wrapper.unmount()
  })

  it('footer 插槽：渲染进 .ui-artifact__footer', async () => {
    const wrapper = await mountArtifact({ modelValue: true }, { footer: () => '动作区' })
    expect(document.body.querySelector('.ui-artifact__footer')?.textContent).toBe('动作区')
    wrapper.unmount()
  })

  it('attrs 透传：aria-label 落到面板元素（header 插槽场景的面板命名路径）', async () => {
    const wrapper = await mountArtifact({ modelValue: true, 'aria-label': '重构建议' }, { header: () => '自定义头部' })
    const panel = document.body.querySelector<HTMLElement>('.ui-artifact__panel')
    expect(panel?.getAttribute('aria-label')).toBe('重构建议')
    wrapper.unmount()
  })
})
