// behavior spec：选中（单/多/受控）/ 级联勾选 / 展开折叠（受控/非受控）/ 键盘路径 / 数据响应。
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DOMWrapper, VueWrapper } from '@vue/test-utils'
import Tree from './Tree.vue'
import type { TreeNode } from './Tree.types'

const data: TreeNode[] = [
  {
    key: 'src',
    title: 'src',
    children: [
      {
        key: 'components',
        title: 'components',
        children: [
          { key: 'button', title: 'Button' },
          { key: 'input', title: 'Input' },
        ],
      },
      { key: 'index', title: 'index.ts' },
    ],
  },
  { key: 'readme', title: 'README.md', disabled: true },
]

function items(wrapper: VueWrapper): DOMWrapper<HTMLElement>[] {
  // treeitem 为 div（role 声明），断言焦点/属性时按 HTMLElement 取用（显式桥接，非 any）。
  return wrapper.findAll('[role="treeitem"]') as unknown as DOMWrapper<HTMLElement>[]
}

function itemByText(wrapper: VueWrapper, title: string): DOMWrapper<HTMLElement> {
  const item = items(wrapper).find((node) => node.text() === title)
  if (!item) throw new Error(`treeitem not found: ${title}`)
  return item
}

function checkedOf(item: DOMWrapper<HTMLElement>): boolean {
  return (item.find('input[type="checkbox"]').element as HTMLInputElement).checked
}

function indeterminateOf(item: DOMWrapper<HTMLElement>): boolean {
  return (item.find('input[type="checkbox"]').element as HTMLInputElement).indeterminate
}

describe('Tree behavior', () => {
  // ── 选中 ──────────────────────────────────────────────────
  it('单选：点击标题选中，aria-selected 随之切换', async () => {
    const wrapper = mount(Tree, { props: { data } })
    await itemByText(wrapper, 'Button').trigger('click')
    expect(itemByText(wrapper, 'Button').attributes('aria-selected')).toBe('true')
    await itemByText(wrapper, 'Input').trigger('click')
    expect(itemByText(wrapper, 'Button').attributes('aria-selected')).toBe('false')
    expect(itemByText(wrapper, 'Input').attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toEqual([['button'], ['input']])
  })

  it('单选：重复点击已选节点不取消（不发事件）', async () => {
    const wrapper = mount(Tree, { props: { data, modelValue: 'button' } })
    await itemByText(wrapper, 'Button').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(itemByText(wrapper, 'Button').attributes('aria-selected')).toBe('true')
  })

  it('多选：点击切换，累计与移除均同步 aria-selected 与 payload', async () => {
    const wrapper = mount(Tree, { props: { data, multiple: true } })
    await itemByText(wrapper, 'Button').trigger('click')
    expect(itemByText(wrapper, 'Button').attributes('aria-selected')).toBe('true')
    await itemByText(wrapper, 'Input').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toEqual(['button', 'input'])
    await itemByText(wrapper, 'Button').trigger('click')
    expect(itemByText(wrapper, 'Button').attributes('aria-selected')).toBe('false')
    expect(wrapper.emitted('update:modelValue')?.[2]?.[0]).toEqual(['input'])
  })

  it('非受控选中：不传 modelValue 也更新内部状态与 aria-selected', async () => {
    const wrapper = mount(Tree, { props: { data } })
    await itemByText(wrapper, 'src').trigger('click')
    expect(itemByText(wrapper, 'src').attributes('aria-selected')).toBe('true')
  })

  it('受控选中：点击只发事件，aria-selected 待 prop 更新后才变', async () => {
    const wrapper = mount(Tree, { props: { data, modelValue: 'button' } })
    await itemByText(wrapper, 'Input').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(
      expect.objectContaining({ key: 'input', selected: true }),
    )
    expect(itemByText(wrapper, 'Input').attributes('aria-selected')).toBe('false')
    await wrapper.setProps({ modelValue: 'input' })
    expect(itemByText(wrapper, 'Input').attributes('aria-selected')).toBe('true')
    expect(itemByText(wrapper, 'Button').attributes('aria-selected')).toBe('false')
  })

  it('禁用节点：点击不选中、不发事件', async () => {
    const wrapper = mount(Tree, { props: { data } })
    await itemByText(wrapper, 'README.md').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(itemByText(wrapper, 'README.md').attributes('aria-selected')).toBe('false')
  })

  // ── 勾选 ──────────────────────────────────────────────────
  it('勾选父节点：级联勾选全部可用后代（禁用节点排除）', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    await itemByText(wrapper, 'src').find('input[type="checkbox"]').setValue(true)
    expect(checkedOf(itemByText(wrapper, 'src'))).toBe(true)
    expect(checkedOf(itemByText(wrapper, 'components'))).toBe(true)
    expect(checkedOf(itemByText(wrapper, 'Button'))).toBe(true)
    expect(checkedOf(itemByText(wrapper, 'index.ts'))).toBe(true)
    expect(checkedOf(itemByText(wrapper, 'README.md'))).toBe(false) // 禁用不入级联
  })

  it('取消后代勾选：祖先回算为未勾 + 半选（indeterminate）', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    await itemByText(wrapper, 'src').find('input[type="checkbox"]').setValue(true)
    await itemByText(wrapper, 'Button').find('input[type="checkbox"]').setValue(false)
    expect(checkedOf(itemByText(wrapper, 'Button'))).toBe(false)
    expect(checkedOf(itemByText(wrapper, 'components'))).toBe(false)
    expect(indeterminateOf(itemByText(wrapper, 'components'))).toBe(true)
    expect(checkedOf(itemByText(wrapper, 'src'))).toBe(false)
    expect(indeterminateOf(itemByText(wrapper, 'src'))).toBe(true)
    // index 由父级级联时已勾选，取消 button 后仍在集合内。
    expect(wrapper.emitted('check')?.[1]?.[0]).toEqual(
      expect.objectContaining({ key: 'button', checked: false, checkedKeys: ['input', 'index'] }),
    )
  })

  it('勾满全部可用后代：祖先自动全勾（含原先半选）', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    await itemByText(wrapper, 'Button').find('input[type="checkbox"]').setValue(true)
    expect(checkedOf(itemByText(wrapper, 'src'))).toBe(false)
    expect(indeterminateOf(itemByText(wrapper, 'src'))).toBe(true)
    await itemByText(wrapper, 'Input').find('input[type="checkbox"]').setValue(true)
    await itemByText(wrapper, 'index.ts').find('input[type="checkbox"]').setValue(true)
    expect(checkedOf(itemByText(wrapper, 'components'))).toBe(true)
    expect(checkedOf(itemByText(wrapper, 'src'))).toBe(true)
    expect(indeterminateOf(itemByText(wrapper, 'src'))).toBe(false)
  })

  it('禁用节点：勾选与取消均为 no-op（不发 check）', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    // VTU setValue 直接改写 DOM checked（绕过原生 disabled）；真实用户无法触发
    // disabled input 的 change，故只断言组件语义：不发 check、选中态不受影响。
    await itemByText(wrapper, 'README.md').find('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('check')).toBeUndefined()
    await itemByText(wrapper, 'README.md').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(itemByText(wrapper, 'README.md').attributes('aria-selected')).toBe('false')
  })

  // ── 展开折叠 ──────────────────────────────────────────────
  it('非受控展开折叠：点击 toggle 切换子树可见性与 aria-expanded', async () => {
    const wrapper = mount(Tree, { props: { data } })
    await itemByText(wrapper, 'components').find('button.ui-tree__toggle').trigger('click')
    expect(itemByText(wrapper, 'components').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Button')
    await itemByText(wrapper, 'components').find('button.ui-tree__toggle').trigger('click')
    expect(itemByText(wrapper, 'components').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Button')
  })

  it('受控展开：点击只发 expand 事件，aria-expanded 待 prop 更新后才变', async () => {
    const wrapper = mount(Tree, { props: { data, expandedKeys: ['src'] } })
    expect(wrapper.text()).not.toContain('Button') // components 未展开
    await itemByText(wrapper, 'src').find('button.ui-tree__toggle').trigger('click')
    expect(wrapper.emitted('expand')?.[0]?.[0]).toEqual(
      expect.objectContaining({ key: 'src', expanded: false, expandedKeys: [] }),
    )
    expect(itemByText(wrapper, 'src').attributes('aria-expanded')).toBe('true') // prop 未变
    await wrapper.setProps({ expandedKeys: [] })
    expect(itemByText(wrapper, 'src').attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ expandedKeys: ['src', 'components'] })
    expect(itemByText(wrapper, 'components').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Button')
  })

  it('叶子节点无 toggle 按钮；点击叶子标题只选中不展开', async () => {
    const wrapper = mount(Tree, { props: { data } })
    expect(itemByText(wrapper, 'Button').find('button').exists()).toBe(false)
    await itemByText(wrapper, 'Button').trigger('click')
    expect(wrapper.emitted('expand')).toBeUndefined()
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('点击 toggle 按钮不会误触发选中（按钮区域各自语义）', async () => {
    const wrapper = mount(Tree, { props: { data } })
    await itemByText(wrapper, 'src').find('button.ui-tree__toggle').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('expand')).toHaveLength(1)
  })

  // ── 键盘路径（WAI-ARIA Tree View）──────────────────────────
  // 焦点断言需要组件挂在 document 上（VTU 默认挂到游离树，document.activeElement
  // 不会离开 body）：用 attachTo 挂载并在测试末尾 unmount。
  it('↑/↓ 在可见序上移动焦点（roving tabindex 跟随）', async () => {
    const wrapper = mount(Tree, { props: { data }, attachTo: document.body })
    const src = itemByText(wrapper, 'src')
    src.element.focus()
    await src.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'components').element)
    await itemByText(wrapper, 'components').trigger('keydown', { key: 'ArrowUp' })
    await nextTick()
    expect(document.activeElement).toBe(src.element)
    wrapper.unmount()
  })

  it('→ 展开折叠中的父节点；再按 → 进入首个子节点', async () => {
    const wrapper = mount(Tree, { props: { data }, attachTo: document.body })
    // 初始展开全部：先 ← 折叠 src，再走 → 路径。
    await itemByText(wrapper, 'src').trigger('keydown', { key: 'ArrowLeft' })
    expect(itemByText(wrapper, 'src').attributes('aria-expanded')).toBe('false')
    await itemByText(wrapper, 'src').trigger('keydown', { key: 'ArrowRight' })
    expect(itemByText(wrapper, 'src').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Button')
    await itemByText(wrapper, 'src').trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'components').element)
    wrapper.unmount()
  })

  it('← 折叠已展开父节点；叶子按 ← 回到最近可见祖先', async () => {
    const wrapper = mount(Tree, { props: { data }, attachTo: document.body })
    await itemByText(wrapper, 'Button').trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'components').element)
    await itemByText(wrapper, 'components').trigger('keydown', { key: 'ArrowLeft' })
    expect(itemByText(wrapper, 'components').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Button')
    wrapper.unmount()
  })

  it('Home/End 跳转首个/末个可用可见节点（跳过末尾禁用节点）', async () => {
    const wrapper = mount(Tree, { props: { data }, attachTo: document.body })
    await itemByText(wrapper, 'Button').trigger('keydown', { key: 'End' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'index.ts').element)
    await itemByText(wrapper, 'index.ts').trigger('keydown', { key: 'Home' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'src').element)
    wrapper.unmount()
  })

  it('Enter 选中节点且仅触发一次；Enter 不触发勾选', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    await itemByText(wrapper, 'Button').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('check')).toBeUndefined()
  })

  it('Space 在 checkable 时切换勾选（级联），在非 checkable 时选中', async () => {
    const checkable = mount(Tree, { props: { data, checkable: true } })
    await itemByText(checkable, 'src').trigger('keydown', { key: ' ' })
    expect(checkedOf(itemByText(checkable, 'src'))).toBe(true)
    expect(checkedOf(itemByText(checkable, 'Button'))).toBe(true)
    expect(checkable.emitted('check')).toHaveLength(1)

    const plain = mount(Tree, { props: { data } })
    await itemByText(plain, 'src').trigger('keydown', { key: ' ' })
    expect(itemByText(plain, 'src').attributes('aria-selected')).toBe('true')
    expect(plain.emitted('select')).toHaveLength(1)
  })

  it('禁用节点：键盘 Enter / Space 均为 no-op（不发 select/check，与导航跳过禁用配套）', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    await itemByText(wrapper, 'README.md').trigger('keydown', { key: 'Enter' })
    await itemByText(wrapper, 'README.md').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('check')).toBeUndefined()
  })

  it('toggle 按钮 / checkbox 上的 Enter·Space 不被节点语义接管（避免双触发）', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    const toggle = itemByText(wrapper, 'src').find('button.ui-tree__toggle')
    await toggle.trigger('keydown', { key: 'Enter' })
    await toggle.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('check')).toBeUndefined()
    // 原生 click 仍走展开语义。
    await toggle.trigger('click')
    expect(wrapper.emitted('expand')).toHaveLength(1)
  })

  it('方向键 preventDefault（↑↓ 不滚动页面）', async () => {
    const wrapper = mount(Tree, { props: { data } })
    const src = itemByText(wrapper, 'src')
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      src.element.dispatchEvent(event)
      expect(event.defaultPrevented, `key: ${key}`).toBe(true)
    }
    await nextTick()
  })

  // ── 响应式与边界 ──────────────────────────────────────────
  it('data 变化响应式：新增节点随展开状态渲染', async () => {
    const wrapper = mount(Tree, { props: { data: structuredClone(data) } })
    await wrapper.setProps({
      data: [
        ...structuredClone(data),
        { key: 'license', title: 'LICENSE', children: [{ key: 'mit', title: 'MIT' }] },
      ],
    })
    expect(items(wrapper)).toHaveLength(7) // 原 6 + license（非受控展开为初始快照，新增父节点默认折叠）
    expect(wrapper.text()).toContain('LICENSE')
    expect(wrapper.text()).not.toContain('MIT')
  })

  it('焦点节点被移除后 roving tabindex 回落到首个可见节点', async () => {
    const wrapper = mount(Tree, { props: { data } })
    const button = itemByText(wrapper, 'Button')
    button.element.focus()
    await wrapper.setProps({ data: [data[1]!] })
    await nextTick()
    const remaining = items(wrapper)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.attributes('tabindex')).toBe('0')
    expect(remaining[0]?.text()).toBe('README.md')
  })

  it('loading → false：骨架行切换为数据行', async () => {
    const wrapper = mount(Tree, { props: { data, loading: true } })
    expect(wrapper.findAll('.ui-tree__item--skeleton')).toHaveLength(3)
    await wrapper.setProps({ loading: false })
    expect(wrapper.find('.ui-tree__item--skeleton').exists()).toBe(false)
    expect(items(wrapper)).toHaveLength(6)
  })

  it('data → []：数据行切换为空态', async () => {
    const wrapper = mount(Tree, { props: { data } })
    await wrapper.setProps({ data: [] })
    expect(wrapper.find('ul[role="tree"]').exists()).toBe(false)
    expect(wrapper.find('.ui-tree__empty').text()).toBe('暂无数据')
  })
})
