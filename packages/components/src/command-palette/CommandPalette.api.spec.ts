// api spec：props 默认值 / emits 声明 / slots 渲染 / attrs 透传。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import type { VNode } from 'vue'
import CommandPalette from './CommandPalette.vue'
import {
  COMMAND_PALETTE_EMPTY_TEXT,
  COMMAND_PALETTE_PLACEHOLDER_DEFAULT,
} from './CommandPalette.constants'
import type { CommandPaletteGroup, CommandPaletteItemScope } from './CommandPalette.types'

/** 图标用函数式内联 SVG 组件（与使用方传法一致）。 */
const Icon = () => h('svg', { viewBox: '0 0 24 24' })

/** 启用命令序 = [0 回到首页, 1 打开文档, 3 删除项目]；2 为 disabled。 */
const GROUPS: CommandPaletteGroup[] = [
  {
    key: 'nav',
    label: '导航',
    items: [
      { key: 'home', label: '回到首页', hint: 'G H', icon: Icon },
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

/** 以打开态挂载（attachTo document.body：焦点/Teleport 查询才与真实使用一致）。返回类型保持 mount 推断（vm 携带 expose 类型）。 */
async function mountOpen(props: Record<string, unknown> = {}) {
  const wrapper = mount(CommandPalette, {
    props: { groups: GROUPS, modelValue: true, ...props },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  // 两次 tick：isMounted → Teleport 落地；activate → 焦点移入搜索框。
  await nextTick()
  await nextTick()
  return wrapper
}

/** 以打开态挂载并附带插槽（mountOpen 的插槽版：mount 的 slots 类型按字面量收敛）。 */
async function mountOpenWithSlots(
  props: Record<string, unknown>,
  slots: {
    header?: () => VNode
    item?: (scope: CommandPaletteItemScope) => VNode
    empty?: () => VNode
  },
) {
  const wrapper = mount(CommandPalette, {
    props: { groups: GROUPS, modelValue: true, ...props },
    slots,
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  await nextTick()
  await nextTick()
  return wrapper
}

/** body 中的面板（Teleport 目标）。 */
function panelEl(): HTMLElement {
  const el = document.body.querySelector<HTMLElement>('.ui-command-palette__panel')
  if (!el) throw new Error('命令面板未渲染')
  return el
}

/** 搜索输入框。 */
function inputEl(): HTMLInputElement {
  const el = panelEl().querySelector<HTMLInputElement>('input')
  if (!el) throw new Error('搜索输入框未渲染')
  return el
}

/** 全部命令项（DOM 序 = 过滤视图序）。 */
function optionEls(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.ui-command-palette__option'))
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

describe('CommandPalette api', () => {
  it('modelValue 默认 false：关闭态不渲染浮层（无面板/输入框/命令项）', async () => {
    const wrapper = mount(CommandPalette, {
      props: { groups: GROUPS },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await nextTick()
    expect(document.body.querySelector('.ui-command-palette')).toBeNull()
    expect(document.body.querySelector('.ui-command-palette__panel')).toBeNull()
    expect(document.body.querySelector('input')).toBeNull()
  })

  it('打开态渲染 dialog 面板：scrim + role="dialog" + aria-modal + combobox/listbox 结构', async () => {
    await mountOpen()
    expect(document.body.querySelector('.ui-command-palette__scrim')).not.toBeNull()
    const panel = panelEl()
    expect(panel.getAttribute('role')).toBe('dialog')
    expect(panel.getAttribute('aria-modal')).toBe('true')
    const input = inputEl()
    expect(input.getAttribute('role')).toBe('combobox')
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.getAttribute('aria-autocomplete')).toBe('list')
    const listId = input.getAttribute('aria-controls')
    expect(listId).toBeTruthy()
    const listbox = document.getElementById(listId ?? '')
    expect(listbox?.getAttribute('role')).toBe('listbox')
    expect(listbox?.getAttribute('aria-label')).toBe('命令列表')
  })

  it('placeholder 默认「搜索命令…」', async () => {
    await mountOpen()
    expect(inputEl().getAttribute('placeholder')).toBe(COMMAND_PALETTE_PLACEHOLDER_DEFAULT)
  })

  it('placeholder 可通过 props 覆盖', async () => {
    await mountOpen({ placeholder: '输入命令或搜索…' })
    expect(inputEl().getAttribute('placeholder')).toBe('输入命令或搜索…')
  })

  it('groups 渲染分组与命令：组标题、命令顺序、hint/icon/danger/disabled 落位', async () => {
    await mountOpen()
    const groupLabels = Array.from(
      document.body.querySelectorAll<HTMLElement>('.ui-command-palette__group-label'),
    ).map(el => el.textContent?.trim())
    expect(groupLabels).toEqual(['导航', '操作'])
    const items = optionEls()
    expect(items).toHaveLength(4)
    expect(
      items.map(el => el.querySelector('.ui-command-palette__option-label')?.textContent?.trim()),
    ).toEqual(['回到首页', '打开文档', '分享', '删除项目'])
    expect(items[0].querySelector('.ui-command-palette__option-hint')?.textContent?.trim()).toBe('G H')
    expect(items[0].querySelector('.ui-command-palette__option-icon svg')).not.toBeNull()
    expect(items[3].classList.contains('ui-command-palette__option--danger')).toBe(true)
    expect(items[2].classList.contains('ui-command-palette__option--disabled')).toBe(true)
    expect(items[2].getAttribute('aria-disabled')).toBe('true')
  })

  it('select 已声明：点击命令项发出 select(key) 与 update:modelValue(false)', async () => {
    const wrapper = await mountOpen()
    await new DOMWrapper(optionEls()[3]).trigger('click')
    expect(wrapper.emitted('select')).toEqual([['remove']])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('header 插槽渲染于搜索框上方，面板 aria-labelledby 指向它（aria-label 让位）', async () => {
    await mountOpenWithSlots(
      {},
      { header: () => h('p', { class: 'palette-header' }, '快速操作') },
    )
    const panel = panelEl()
    const labelledBy = panel.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(panel.getAttribute('aria-label')).toBeNull()
    const header = document.getElementById(labelledBy ?? '')
    expect(header?.classList.contains('ui-command-palette__header')).toBe(true)
    expect(header?.textContent).toContain('快速操作')
  })

  it('item 插槽作用域：command 为命令数据、active 为是否激活项', async () => {
    await mountOpenWithSlots(
      {},
      {
        item: (scope: CommandPaletteItemScope) =>
          h('span', { class: 'custom-item' }, `${scope.command.label}|${scope.active ? 'A' : 'x'}`),
      },
    )
    const items = optionEls()
    // 打开时激活项复位到首个启用命令（home=0）：自定义渲染拿到 active 作用域
    expect(items[0].querySelector('.custom-item')?.textContent).toBe('回到首页|A')
    expect(items[1].querySelector('.custom-item')?.textContent).toBe('打开文档|x')
  })

  it('empty：过滤后无可见命令时渲染默认文案，empty 插槽可覆盖', async () => {
    await mountOpen({ groups: [] })
    expect(panelEl().querySelector('.ui-command-palette__empty')?.textContent?.trim()).toBe(
      COMMAND_PALETTE_EMPTY_TEXT,
    )
    await mountOpenWithSlots(
      { groups: [] },
      { empty: () => h('p', { class: 'custom-empty' }, '没有找到命令') },
    )
    expect(document.body.querySelector('.custom-empty')?.textContent).toBe('没有找到命令')
  })

  it('expose：focus/blur 聚焦与移除搜索输入框焦点', async () => {
    const wrapper = await mountOpen()
    const input = inputEl()
    wrapper.vm.blur()
    expect(document.activeElement).not.toBe(input)
    wrapper.vm.focus()
    expect(document.activeElement).toBe(input)
  })

  it('attrs 透传（inheritAttrs:false）：合并到搜索输入框（aria-label/id/aria-describedby），不落浮层根', async () => {
    const wrapper = mount(CommandPalette, {
      props: { groups: GROUPS, modelValue: true },
      attrs: { 'aria-label': '全局命令搜索', id: 'cmd-palette-input', 'aria-describedby': 'cmd-palette-tip' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await nextTick()
    await nextTick()
    // 落点为 combobox 搜索输入框（可访问名称与外部说明关联通道，同 autocomplete/cascader 家族）
    const input = inputEl()
    expect(input.getAttribute('aria-label')).toBe('全局命令搜索')
    expect(input.getAttribute('id')).toBe('cmd-palette-input')
    expect(input.getAttribute('aria-describedby')).toBe('cmd-palette-tip')
    // 浮层根（Teleport 根 div）不接收 attrs
    expect(document.body.querySelector('.ui-command-palette')?.getAttribute('aria-label')).toBeNull()
    expect(document.body.querySelector('.ui-command-palette')?.getAttribute('id')).toBeNull()
    expect(document.body.querySelector('.ui-command-palette')?.getAttribute('aria-describedby')).toBeNull()
  })
})
