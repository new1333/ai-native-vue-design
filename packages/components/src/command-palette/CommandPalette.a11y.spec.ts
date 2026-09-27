// a11y spec：dialog/combobox/listbox aria 契约、aria-activedescendant 漫游、输入框命名透传与全部键盘路径。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import CommandPalette from './CommandPalette.vue'
import type { CommandPaletteGroup } from './CommandPalette.types'

/** 启用命令序 = [0 回到首页, 1 打开文档, 3 删除项目]；2 为 disabled（漫游必须跳过）。 */
const GROUPS: CommandPaletteGroup[] = [
  {
    key: 'nav',
    label: '导航',
    items: [
      { key: 'home', label: '回到首页' },
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

/** 以打开态挂载（attachTo document.body：焦点/activeElement 断言才与真实使用一致）。 */
async function mountOpen(props: Record<string, unknown> = {}): Promise<VueWrapper> {
  const wrapper = mount(CommandPalette, {
    props: { groups: GROUPS, modelValue: true, ...props },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  await nextTick()
  await nextTick()
  return wrapper
}

function panelEl(): HTMLElement {
  const el = document.body.querySelector<HTMLElement>('.ui-command-palette__panel')
  if (!el) throw new Error('命令面板未渲染')
  return el
}

function inputEl(): HTMLInputElement {
  const el = panelEl().querySelector<HTMLInputElement>('input')
  if (!el) throw new Error('搜索输入框未渲染')
  return el
}

function input(): DOMWrapper<HTMLInputElement> {
  return new DOMWrapper(inputEl())
}

/** 全部命令项（DOM 序 = 过滤视图序）。 */
function optionEls(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]'))
}

/** 当前激活命令项（aria-activedescendant 反查元素；无激活项时为 null）。 */
function activeOption(): HTMLElement | null {
  const id = inputEl().getAttribute('aria-activedescendant')
  return id ? (document.getElementById(id) as HTMLElement | null) : null
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('CommandPalette a11y', () => {
  it('面板 role="dialog" + aria-modal="true"，无 header 插槽时以 aria-label 命名', async () => {
    await mountOpen()
    expect(panelEl().getAttribute('role')).toBe('dialog')
    expect(panelEl().getAttribute('aria-modal')).toBe('true')
    expect(panelEl().getAttribute('aria-label')).toBe('命令面板')
    expect(panelEl().getAttribute('aria-labelledby')).toBeNull()
  })

  it('header 插槽时面板改用 aria-labelledby 指向头部（命名不缺失）', async () => {
    const wrapper = mount(CommandPalette, {
      props: { groups: GROUPS, modelValue: true },
      slots: { header: () => h('p', {}, '快速操作') },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await nextTick()
    await nextTick()
    const labelledBy = panelEl().getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(panelEl().getAttribute('aria-label')).toBeNull()
    expect(document.getElementById(labelledBy ?? '')?.textContent).toContain('快速操作')
  })

  it('combobox 契约：aria-expanded/aria-autocomplete/aria-controls → role="listbox"', async () => {
    await mountOpen()
    const input = inputEl()
    expect(input.getAttribute('role')).toBe('combobox')
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.getAttribute('aria-autocomplete')).toBe('list')
    const listbox = document.getElementById(input.getAttribute('aria-controls') ?? '')
    expect(listbox?.getAttribute('role')).toBe('listbox')
    expect(listbox?.getAttribute('aria-label')).toBe('命令列表')
  })

  it('命令项为 role="option"（非 DOM 可聚焦，焦点恒驻输入框）：激活项 aria-selected=true、其余 false、disabled 项 aria-disabled=true', async () => {
    await mountOpen()
    const items = optionEls()
    expect(items).toHaveLength(4)
    for (const el of items) {
      expect(el.getAttribute('role')).toBe('option')
      expect(el.getAttribute('tabindex')).toBeNull()
    }
    expect(items[0].getAttribute('aria-selected')).toBe('true')
    expect(items[1].getAttribute('aria-selected')).toBe('false')
    expect(items[2].getAttribute('aria-selected')).toBe('false')
    expect(items[2].getAttribute('aria-disabled')).toBe('true')
    // aria-activedescendant 模式：焦点在输入框上，而非任一 option
    expect(document.activeElement).toBe(inputEl())
    expect(optionEls().includes(document.activeElement as HTMLElement)).toBe(false)
  })

  it('aria-activedescendant 初始指向首个启用命令，元素 id 可反查', async () => {
    await mountOpen()
    const active = activeOption()
    expect(active).not.toBeNull()
    expect(active).toBe(optionEls()[0])
    expect(active?.textContent).toContain('回到首页')
  })

  it('hover disabled 命令项：aria-activedescendant 不指向 aria-disabled 项（与漫游一致跳过 disabled）', async () => {
    await mountOpen()
    await new DOMWrapper(optionEls()[2]).trigger('mouseenter') // disabled「分享」
    const descendantId = inputEl().getAttribute('aria-activedescendant')
    expect(optionEls()[2].getAttribute('aria-disabled')).toBe('true')
    expect(descendantId).toBe(optionEls()[0].id)
    expect(document.getElementById(descendantId ?? '')?.getAttribute('aria-disabled')).toBeNull()
  })

  it('↓ 环绕漫游且跳过 disabled：0 → 1 → 3 → 0（wrap）；↑ 反向 0 → 3', async () => {
    await mountOpen()
    await input().trigger('keydown', { key: 'ArrowDown' })
    expect(activeOption()).toBe(optionEls()[1])
    await input().trigger('keydown', { key: 'ArrowDown' })
    expect(activeOption()).toBe(optionEls()[3]) // 跳过 disabled 的「分享」
    await input().trigger('keydown', { key: 'ArrowDown' })
    expect(activeOption()).toBe(optionEls()[0]) // 环绕回首项
    await input().trigger('keydown', { key: 'ArrowUp' })
    expect(activeOption()).toBe(optionEls()[3])
  })

  it('Home / End：激活项移到首个 / 最后一个启用命令', async () => {
    await mountOpen()
    await input().trigger('keydown', { key: 'End' })
    expect(activeOption()).toBe(optionEls()[3])
    await input().trigger('keydown', { key: 'Home' })
    expect(activeOption()).toBe(optionEls()[0])
  })

  it('激活项 aria-selected 随漫游移动（同一时刻仅一项 true）', async () => {
    await mountOpen()
    await input().trigger('keydown', { key: 'ArrowDown' })
    const selected = optionEls().filter(el => el.getAttribute('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
    expect(selected[0]).toBe(optionEls()[1])
  })

  it('Enter：选中激活命令（select 载荷为 key）、请求关闭、焦点还原打开前元素', async () => {
    const wrapper = await mountOpen()
    await input().trigger('keydown', { key: 'ArrowDown' })
    await input().trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([['docs']])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    await wrapper.setProps({ modelValue: false })
    await nextTick()
    expect(document.body.querySelector('.ui-command-palette__panel')).toBeNull()
    expect(document.activeElement).toBe(document.body)
  })

  it('Enter 无激活命令（全 disabled）：不选中、不关闭', async () => {
    const wrapper = await mountOpen({
      groups: [{ key: 'all', label: '全部禁用', items: [{ key: 'a', label: '甲', disabled: true }] }],
    })
    expect(inputEl().getAttribute('aria-activedescendant')).toBeNull()
    await input().trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(panelEl()).not.toBeNull()
  })

  it('Esc：请求关闭（面板级键盘关闭路径）', async () => {
    const wrapper = await mountOpen()
    await input().trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('Tab：焦点被圈定在搜索输入框（面板内唯一可聚焦元素）', async () => {
    await mountOpen()
    await input().trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(inputEl())
  })

  it('搜索输入框命名：使用方经 attrs 传入的 aria-label 落在 combobox 输入框（可访问名称不缺失，不落面板）', async () => {
    const wrapper = mount(CommandPalette, {
      props: { groups: GROUPS, modelValue: true },
      attrs: { 'aria-label': '全局命令搜索' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await nextTick()
    await nextTick()
    expect(inputEl().getAttribute('aria-label')).toBe('全局命令搜索')
    expect(panelEl().getAttribute('aria-label')).toBe('命令面板')
  })

  it('group 契约：role="group" 且 aria-labelledby 指向组标题；组标题不是 option', async () => {
    await mountOpen()
    const groups = Array.from(document.body.querySelectorAll<HTMLElement>('[role="group"]'))
    expect(groups).toHaveLength(2)
    const expectedLabels = ['导航', '操作']
    groups.forEach((group, index) => {
      const labelledBy = group.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()
      const label = document.getElementById(labelledBy ?? '')
      expect(label?.classList.contains('ui-command-palette__group-label')).toBe(true)
      expect(label?.textContent?.trim()).toBe(expectedLabels[index])
      expect(label?.getAttribute('role')).toBeNull()
      expect(group.querySelector('[role="option"]')).not.toBeNull()
    })
  })
})
