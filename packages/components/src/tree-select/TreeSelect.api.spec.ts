// api spec：props 默认值 / emits 声明 / 三种选中语义的渲染面 / slots / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TreeSelect from './TreeSelect.vue'
import type { TreeSelectOption } from './TreeSelect.types'

export const TREE: TreeSelectOption[] = [
  {
    label: '研发部',
    value: 'rd',
    children: [
      { label: '前端组', value: 'fe' },
      { label: '后端组', value: 'be', disabled: true },
    ],
  },
  { label: '设计部', value: 'design' },
  { label: '运营部', value: 'ops', disabled: true },
]

const findTrigger = (wrapper: ReturnType<typeof mount>) => wrapper.find('button.ui-tree-select__trigger')

async function openTree(wrapper: ReturnType<typeof mount>): Promise<void> {
  await findTrigger(wrapper).trigger('click')
  await nextTick()
}

describe('TreeSelect api', () => {
  it('渲染 ui-tree-select 根容器与 combobox 触发器按钮', () => {
    const wrapper = mount(TreeSelect)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-tree-select')
    const trigger = findTrigger(wrapper)
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-haspopup')).toBe('tree')
  })

  it('默认：显示默认 placeholder、aria-expanded=false、无高亮/无弹层/无清空按钮', () => {
    const wrapper = mount(TreeSelect)
    const trigger = findTrigger(wrapper)
    expect(trigger.text()).toContain('请选择')
    expect(wrapper.find('.ui-tree-select__label--placeholder').exists()).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('button.ui-tree-select__clear').exists()).toBe(false)
    expect(document.querySelector('.ui-tree-select__tree')).toBeNull()
  })

  it('placeholder prop 覆盖默认占位文案', () => {
    const trigger = mount(TreeSelect, { props: { placeholder: '选择部门' } }).find(
      'button.ui-tree-select__trigger',
    )
    expect(trigger.text()).toContain('选择部门')
  })

  it('单选：modelValue 命中节点显示其 label，未命中（null/未知值）回落 placeholder', () => {
    const selected = mount(TreeSelect, { props: { options: TREE, modelValue: 'design' } })
    expect(findTrigger(selected).text()).toContain('设计部')
    expect(selected.find('.ui-tree-select__label--placeholder').exists()).toBe(false)
    const unknown = mount(TreeSelect, { props: { options: TREE, modelValue: 'nope' } })
    expect(findTrigger(unknown).text()).toContain('请选择')
  })

  it('multiple：数组值触发器以「、」连接命中 label；空数组回落 placeholder', () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, multiple: true, modelValue: ['design', 'fe'] },
    })
    expect(findTrigger(wrapper).text()).toContain('设计部、前端组')
    const empty = mount(TreeSelect, { props: { options: TREE, multiple: true, modelValue: [] } })
    expect(findTrigger(empty).text()).toContain('请选择')
  })

  it('checkable：传入父值级联展开——触发器显示全勾选 label 集（禁用后代不计入）', () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, checkable: true, modelValue: ['rd'] },
    })
    expect(findTrigger(wrapper).text()).toContain('研发部、前端组')
    expect(findTrigger(wrapper).text()).not.toContain('后端组')
  })

  it('disabled：触发器原生 disabled + 根修饰类，且不渲染清空按钮', () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, modelValue: 'design', disabled: true, clearable: true },
    })
    expect(findTrigger(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-tree-select--disabled')
    expect(wrapper.find('button.ui-tree-select__clear').exists()).toBe(false)
  })

  it('clearable：有值（单选值 / 非空数组）渲染清空按钮（aria-label="清空"），空数组/未选不渲染', () => {
    const single = mount(TreeSelect, { props: { options: TREE, modelValue: 'design', clearable: true } })
    expect(single.find('button.ui-tree-select__clear').attributes('aria-label')).toBe('清空')
    const multi = mount(TreeSelect, {
      props: { options: TREE, multiple: true, modelValue: ['fe'], clearable: true },
    })
    expect(multi.find('button.ui-tree-select__clear').exists()).toBe(true)
    const emptyArray = mount(TreeSelect, {
      props: { options: TREE, multiple: true, modelValue: [], clearable: true },
    })
    expect(emptyArray.find('button.ui-tree-select__clear').exists()).toBe(false)
    const none = mount(TreeSelect, { props: { options: TREE, clearable: true } })
    expect(none.find('button.ui-tree-select__clear').exists()).toBe(false)
  })

  it('打开后：面板 role=tree，初始渲染折叠后的可见根节点（含 disabled 节点），带 aria-level', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    const tree = document.querySelector('.ui-tree-select__tree')
    expect(tree).not.toBeNull()
    expect(tree?.getAttribute('role')).toBe('tree')
    const nodes = [...(tree?.querySelectorAll('.ui-tree-select__node') ?? [])]
    expect(nodes.map((el) => el.textContent?.trim())).toEqual(['研发部', '设计部', '运营部'])
    expect(nodes.map((el) => el.getAttribute('aria-level'))).toEqual(['1', '1', '1'])
    expect(nodes[0].getAttribute('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('emptyText：options 为空数组时面板显示空态文案（默认"暂无选项"）；empty 插槽覆盖之', async () => {
    const wrapper = mount(TreeSelect, { props: { options: [] }, attachTo: document.body })
    await openTree(wrapper)
    expect(document.querySelector('.ui-tree-select__empty')?.textContent?.trim()).toBe('暂无选项')
    wrapper.unmount()

    const custom = mount(TreeSelect, {
      props: { options: [], emptyText: '加载中…' },
      attachTo: document.body,
    })
    await openTree(custom)
    expect(document.querySelector('.ui-tree-select__empty')?.textContent?.trim()).toBe('加载中…')
    custom.unmount()

    const slotted = mount(TreeSelect, {
      props: { options: [] },
      slots: { empty: '<span class="custom-empty">无数据</span>' },
      attachTo: document.body,
    })
    await openTree(slotted)
    expect(document.querySelector('.custom-empty')?.textContent).toBe('无数据')
    expect(document.querySelector('.ui-tree-select__empty')?.textContent?.trim()).not.toBe('暂无选项')
    slotted.unmount()
  })

  it('option 插槽：节点文案区自定义（缩进/箭标/复选框仍由组件渲染）', async () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE },
      slots: {
        option: `<template #option="{ option }"><em class="custom-node">{{ option.label }}!</em></template>`,
      },
      attachTo: document.body,
    })
    await openTree(wrapper)
    const customNodes = [...document.querySelectorAll('.custom-node')]
    expect(customNodes.length).toBe(3)
    expect(customNodes[0]?.textContent).toBe('研发部!')
    expect(customNodes[1]?.textContent).toBe('设计部!')
    expect(document.querySelectorAll('.ui-tree-select__node').length).toBe(3)
    wrapper.unmount()
  })

  it('trigger 插槽：覆盖触发器文案区（作用域含 open/displayLabel），箭标仍渲染', () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, modelValue: 'design' },
      slots: {
        trigger: `<template #trigger="{ displayLabel, open }"><b class="custom-trigger">{{ displayLabel }}|{{ open }}</b></template>`,
      },
    })
    expect(wrapper.find('.custom-trigger').exists()).toBe(true)
    expect(wrapper.find('.custom-trigger').text()).toBe('设计部|false')
    expect(wrapper.find('.ui-tree-select__chevron').exists()).toBe(true)
    expect(wrapper.find('.ui-tree-select__label--placeholder').exists()).toBe(false)
  })

  it('update:modelValue 与 change 均已声明：单选以节点 value 为载荷发出', async () => {
    const wrapper = mount(TreeSelect, { props: { options: TREE }, attachTo: document.body })
    await openTree(wrapper)
    ;(document.querySelectorAll('.ui-tree-select__node')[1] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['design']])
    expect(wrapper.emitted('change')).toEqual([['design']])
    wrapper.unmount()
  })

  it('clear 已声明：点击清空按钮发出（载荷见 behavior spec）', async () => {
    const wrapper = mount(TreeSelect, {
      props: { options: TREE, modelValue: 'design', clearable: true },
      attachTo: document.body,
    })
    await wrapper.find('button.ui-tree-select__clear').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
    wrapper.unmount()
  })

  it('attrs 透传（inheritAttrs:false）：合并到触发器 button，不落根容器', () => {
    const wrapper = mount(TreeSelect, {
      attrs: { id: 'dept-select', 'aria-describedby': 'dept-error' },
    })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('id')).toBe('dept-select')
    expect(trigger.attributes('aria-describedby')).toBe('dept-error')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
