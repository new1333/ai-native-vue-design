// behavior spec：全局热键开合、搜索过滤、点击/遮罩/Esc 关闭、关闭重开状态复位、卸载清理。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import CommandPalette from './CommandPalette.vue'
import { COMMAND_PALETTE_EMPTY_TEXT } from './CommandPalette.constants'
import type { CommandPaletteGroup } from './CommandPalette.types'

/** 启用命令序 = [0 回到首页, 1 打开文档, 3 删除项目]；2 为 disabled。 */
const GROUPS: CommandPaletteGroup[] = [
  {
    key: 'nav',
    label: '导航',
    items: [
      { key: 'home', label: '回到首页', hint: 'G H' },
      { key: 'docs', label: '打开文档' },
    ],
  },
  {
    key: 'action',
    label: '操作',
    items: [
      { key: 'share', label: '分享', disabled: true },
      { key: 'remove', label: '删除项目', danger: true },
    ],
  },
]

const wrappers: Array<{ unmount: () => void }> = []

/** 以关闭态挂载（热键行为断言用）。 */
function mountClosed(props: Record<string, unknown> = {}): VueWrapper {
  const wrapper = mount(CommandPalette, {
    props: { groups: GROUPS, ...props },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

/** 以打开态挂载并等 Teleport 落地与焦点移入。 */
async function mountOpen(props: Record<string, unknown> = {}): Promise<VueWrapper> {
  const wrapper = mountClosed({ modelValue: true, ...props })
  await nextTick()
  await nextTick()
  return wrapper
}

function panelEl(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-command-palette__panel')
}

function inputEl(): HTMLInputElement {
  const el = panelEl()?.querySelector<HTMLInputElement>('input')
  if (!el) throw new Error('搜索输入框未渲染')
  return el
}

function optionEls(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.ui-command-palette__option'))
}

/** 全局热键（模拟用户在任意位置按下修饰键组合）。 */
function pressHotkey(modifier: 'metaKey' | 'ctrlKey', key = 'k'): void {
  const init: KeyboardEventInit = { key }
  if (modifier === 'metaKey') init.metaKey = true
  else init.ctrlKey = true
  window.dispatchEvent(new KeyboardEvent('keydown', init))
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('CommandPalette behavior', () => {
  it('Cmd+K / Ctrl+K：请求打开（update:modelValue true）', () => {
    const wrapper = mountClosed()
    pressHotkey('metaKey')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    const wrapper2 = mountClosed()
    pressHotkey('ctrlKey')
    expect(wrapper2.emitted('update:modelValue')).toEqual([[true]])
  })

  it('无修饰键的 k、其他键的组合不触发', () => {
    const wrapper = mountClosed()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('hotkey=false：不注册全局热键', () => {
    const wrapper = mountClosed({ hotkey: false })
    pressHotkey('metaKey')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('hotkey 挂载后 false→true：热键动态注册并生效', async () => {
    const wrapper = mountClosed({ hotkey: false })
    pressHotkey('metaKey')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ hotkey: true })
    pressHotkey('metaKey')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('hotkey 挂载后 true→false：热键动态移除（不再 preventDefault 拦截 Cmd/Ctrl+K）', async () => {
    const wrapper = mountClosed()
    await wrapper.setProps({ hotkey: false })
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('hotkey true→false 后卸载：全局监听已清理（Cmd+K 不被已卸载实例吞掉）', async () => {
    const wrapper = mountClosed()
    await wrapper.setProps({ hotkey: false })
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('打开状态下 Cmd+K：请求关闭（toggle）', async () => {
    const wrapper = await mountOpen()
    pressHotkey('metaKey')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('输入过滤：未命中分组整体隐藏，无匹配时渲染默认 empty 文案', async () => {
    await mountOpen()
    await new DOMWrapper(inputEl()).setValue('文档')
    const items = optionEls()
    expect(items).toHaveLength(1)
    expect(items[0].textContent).toContain('打开文档')
    expect(
      Array.from(document.body.querySelectorAll<HTMLElement>('.ui-command-palette__group-label')).map(
        el => el.textContent?.trim(),
      ),
    ).toEqual(['导航'])
    await new DOMWrapper(inputEl()).setValue('不存在')
    expect(optionEls()).toHaveLength(0)
    expect(document.body.querySelector('.ui-command-palette__empty')?.textContent?.trim()).toBe(
      COMMAND_PALETTE_EMPTY_TEXT,
    )
  })

  it('输入过滤后激活项复位到首个启用命令', async () => {
    await mountOpen()
    const input = new DOMWrapper(inputEl())
    await input.trigger('keydown', { key: 'ArrowDown' }) // 激活 → 打开文档(1)
    expect(inputEl().getAttribute('aria-activedescendant')).toBe(optionEls()[1].id)
    await input.setValue('回') // 过滤后只剩 回到首页(0)
    expect(inputEl().getAttribute('aria-activedescendant')).toBe(optionEls()[0].id)
  })

  it('点击命令项：发出 select(key) 一次并请求关闭；落账后浮层移除', async () => {
    const wrapper = await mountOpen()
    await new DOMWrapper(optionEls()[1]).trigger('click')
    expect(wrapper.emitted('select')).toEqual([['docs']])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    await wrapper.setProps({ modelValue: false })
    await nextTick()
    expect(panelEl()).toBeNull()
  })

  it('点击 disabled 命令：不发出 select、面板保持打开', async () => {
    const wrapper = await mountOpen()
    await new DOMWrapper(optionEls()[2]).trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(panelEl()).not.toBeNull()
  })

  it('hover 命令项：激活项随悬停移动；hover disabled 项不接管（Enter 仍作用于原启用项）', async () => {
    const wrapper = await mountOpen()
    await new DOMWrapper(optionEls()[1]).trigger('mouseenter')
    expect(inputEl().getAttribute('aria-activedescendant')).toBe(optionEls()[1].id)
    await new DOMWrapper(optionEls()[2]).trigger('mouseenter') // disabled「分享」：不接管激活项
    expect(inputEl().getAttribute('aria-activedescendant')).toBe(optionEls()[1].id)
    await new DOMWrapper(inputEl()).trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([['docs']])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('点击遮罩：请求关闭', async () => {
    const wrapper = await mountOpen()
    await new DOMWrapper(document.body.querySelector('.ui-command-palette__scrim') as HTMLElement).trigger(
      'click',
    )
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('Esc（输入框内按键冒泡到面板）：请求关闭', async () => {
    const wrapper = await mountOpen()
    await new DOMWrapper(inputEl()).trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('关闭后重开：query 清空、激活项复位、全部命令回归', async () => {
    const wrapper = await mountOpen()
    await new DOMWrapper(inputEl()).setValue('文档')
    expect(optionEls()).toHaveLength(1)
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()
    expect(inputEl().value).toBe('')
    expect(optionEls()).toHaveLength(4)
    expect(inputEl().getAttribute('aria-activedescendant')).toBe(optionEls()[0].id)
  })

  it('打开状态下卸载：热键监听被移除（后续按键不再引用已卸载实例，不抛错）', async () => {
    const wrapper = await mountOpen()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(() => pressHotkey('metaKey')).not.toThrow()
  })
})
