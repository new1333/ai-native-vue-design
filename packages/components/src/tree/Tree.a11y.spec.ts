// a11y spec：role/aria 契约 / roving tabindex / 键盘序列 / 骨架与空态 aria。
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DOMWrapper, VueWrapper } from '@vue/test-utils'
import Tree from './Tree.vue'
import { TREE_EMPTY_TEXT_DEFAULT, TREE_SKELETON_ROWS } from './Tree.constants'
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

describe('Tree a11y', () => {
  it('role=tree 容器 + li[role=none] 透明容器 + role=treeitem', () => {
    const wrapper = mount(Tree, { props: { data } })
    expect(wrapper.find('ul.ui-tree__list').attributes('role')).toBe('tree')
    for (const li of wrapper.findAll('li.ui-tree__item')) {
      expect(li.attributes('role')).toBe('none')
    }
    expect(items(wrapper)).toHaveLength(6)
    for (const item of items(wrapper)) {
      expect(item.attributes('role')).toBe('treeitem')
    }
  })

  it('层级三元组：aria-level / aria-posinset / aria-setsize 逐级正确', () => {
    const wrapper = mount(Tree, { props: { data } })
    const triples = items(wrapper).map(
      (item) =>
        `${item.attributes('aria-level')}/${item.attributes('aria-posinset')}/${item.attributes('aria-setsize')}`,
    )
    expect(triples).toEqual(['1/1/2', '2/1/2', '3/1/2', '3/2/2', '2/2/2', '1/2/2'])
  })

  it('aria-expanded 常驻父节点且值严格为 true/false；叶子不写该属性', () => {
    const wrapper = mount(Tree, { props: { data } })
    expect(itemByText(wrapper, 'src').attributes('aria-expanded')).toBe('true')
    expect(itemByText(wrapper, 'components').attributes('aria-expanded')).toBe('true')
    expect(itemByText(wrapper, 'Button').attributes('aria-expanded')).toBeUndefined()
    for (const title of ['src', 'components']) {
      expect(['true', 'false']).toContain(itemByText(wrapper, title).attributes('aria-expanded'))
    }
  })

  it('aria-selected 常驻每个 treeitem；aria-disabled 仅禁用节点', () => {
    const wrapper = mount(Tree, { props: { data, modelValue: 'index' } })
    for (const item of items(wrapper)) {
      expect(['true', 'false']).toContain(item.attributes('aria-selected'))
    }
    expect(itemByText(wrapper, 'index.ts').attributes('aria-selected')).toBe('true')
    expect(itemByText(wrapper, 'README.md').attributes('aria-disabled')).toBe('true')
    expect(itemByText(wrapper, 'src').attributes('aria-disabled')).toBeUndefined()
  })

  it('roving tabindex：初始仅首个可见节点 tabindex=0，其余 -1', () => {
    const wrapper = mount(Tree, { props: { data } })
    const tabIndexes = items(wrapper).map((item) => item.attributes('tabindex'))
    expect(tabIndexes).toEqual(['0', '-1', '-1', '-1', '-1', '-1'])
  })

  // 焦点断言需要组件挂在 document 上（VTU 默认挂到游离树）：attachTo + unmount。
  it('键盘 ↓ 移动焦点后 roving tabindex 跟随（焦点元素 0，其余 -1）', async () => {
    const wrapper = mount(Tree, { props: { data }, attachTo: document.body })
    await itemByText(wrapper, 'src').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'components').element)
    expect(itemByText(wrapper, 'components').attributes('tabindex')).toBe('0')
    expect(itemByText(wrapper, 'src').attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('方向键/Home/End preventDefault：不产生默认滚动/跳转', async () => {
    const wrapper = mount(Tree, { props: { data } })
    const src = itemByText(wrapper, 'src')
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      src.element.dispatchEvent(event)
      expect(event.defaultPrevented, `key: ${key}`).toBe(true)
      await nextTick()
    }
  })

  it('键盘序列 ↓↓↓↑：焦点按可见先序移动（折叠子树不占焦点序列），禁用节点跳过', async () => {
    const wrapper = mount(Tree, {
      props: { data, expandedKeys: ['src'] }, // components 自身可见但折叠（无 Button/Input）
      attachTo: document.body,
    })
    expect(items(wrapper).map((item) => item.text())).toEqual([
      'src',
      'components',
      'index.ts',
      'README.md',
    ])
    itemByText(wrapper, 'src').element.focus()
    await itemByText(wrapper, 'src').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'components').element)
    await itemByText(wrapper, 'components').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'index.ts').element)
    // ↓ 至末个可用节点：README.md 禁用被跳过，焦点原地不动（不落禁用项）。
    await itemByText(wrapper, 'index.ts').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'index.ts').element)
    expect(document.activeElement).not.toBe(itemByText(wrapper, 'README.md').element)
    // 焦点因点击落在禁用节点上时，按键仍可移出（↑ 回到最近可用节点）。
    await itemByText(wrapper, 'README.md').trigger('keydown', { key: 'ArrowUp' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'index.ts').element)
    wrapper.unmount()
  })

  it('导航跳过禁用节点：↓/↑ 落点为方向上最近的可用节点，焦点不落禁用项', async () => {
    const navData: TreeNode[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B', disabled: true },
      { key: 'c', title: 'C' },
      { key: 'd', title: 'D', disabled: true },
    ]
    const wrapper = mount(Tree, { props: { data: navData }, attachTo: document.body })
    itemByText(wrapper, 'A').element.focus()
    await itemByText(wrapper, 'A').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'C').element) // B 禁用被跳过
    await itemByText(wrapper, 'C').trigger('keydown', { key: 'ArrowUp' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'A').element) // B 禁用被跳过
    wrapper.unmount()
  })

  it('Home/End 落在可用端点：跳过首/末禁用节点', async () => {
    const edgeData: TreeNode[] = [
      { key: 'a', title: 'A', disabled: true },
      { key: 'b', title: 'B' },
      { key: 'c', title: 'C' },
      { key: 'd', title: 'D', disabled: true },
    ]
    const wrapper = mount(Tree, { props: { data: edgeData }, attachTo: document.body })
    itemByText(wrapper, 'C').element.focus()
    await itemByText(wrapper, 'C').trigger('keydown', { key: 'Home' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'B').element) // A 禁用被跳过
    await itemByText(wrapper, 'B').trigger('keydown', { key: 'End' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'C').element) // D 禁用被跳过
    wrapper.unmount()
  })

  it('←→ 跳过禁用：→ 下钻落首个可用子节点，← 上溯落最近可用祖先', async () => {
    const lrData: TreeNode[] = [
      {
        key: 'gp',
        title: 'GP',
        children: [
          { key: 'p', title: 'P', disabled: true, children: [{ key: 'leaf', title: 'Leaf' }] },
        ],
      },
      {
        key: 'q',
        title: 'Q',
        children: [
          { key: 'q1', title: 'Q1', disabled: true },
          { key: 'q2', title: 'Q2' },
        ],
      },
    ]
    const wrapper = mount(Tree, { props: { data: lrData }, attachTo: document.body })
    // 非受控默认展开全部父节点（GP/P/Q 均展开）：↓ 自 GP 跳过禁用 P 落到 Leaf。
    itemByText(wrapper, 'GP').element.focus()
    await itemByText(wrapper, 'GP').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'Leaf').element)
    // ← 自 Leaf 上溯：父级 P 禁用被跳过，落到最近可用祖先 GP。
    await itemByText(wrapper, 'Leaf').trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'GP').element)
    // → 自已展开的 Q 下钻：首个子节点 Q1 禁用被跳过，落到 Q2。
    await itemByText(wrapper, 'Q').trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(document.activeElement).toBe(itemByText(wrapper, 'Q2').element)
    wrapper.unmount()
  })

  it('展开开关为原生 button（type=button、tabindex=-1）且 aria-label 含动作与标题；图标 aria-hidden', () => {
    const wrapper = mount(Tree, { props: { data } })
    const toggle = itemByText(wrapper, 'src').find('button.ui-tree__toggle')
    expect(toggle.element.tagName).toBe('BUTTON')
    expect(toggle.attributes('type')).toBe('button')
    expect(toggle.attributes('tabindex')).toBe('-1')
    expect(toggle.attributes('aria-label')).toBe('折叠「src」')
    expect(toggle.find('svg').attributes('aria-hidden')).toBe('true')
    // 叶子不渲染开关，用等宽占位保持缩进对齐。
    expect(itemByText(wrapper, 'Button').find('button.ui-tree__toggle').exists()).toBe(false)
    expect(itemByText(wrapper, 'Button').find('.ui-tree__toggle--leaf').exists()).toBe(true)
  })

  it('aria-label 随展开状态切换（展开「…」/ 折叠「…」）', async () => {
    const wrapper = mount(Tree, { props: { data } })
    const toggle = itemByText(wrapper, 'src').find('button.ui-tree__toggle')
    expect(toggle.attributes('aria-label')).toBe('折叠「src」')
    await toggle.trigger('click')
    expect(itemByText(wrapper, 'src').find('button.ui-tree__toggle').attributes('aria-label')).toBe(
      '展开「src」',
    )
  })

  it('勾选框为原生 input[type=checkbox]（tabindex=-1、aria-label=标题、禁用节点原生 disabled）', () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    const checkbox = itemByText(wrapper, 'Button').find('input[type="checkbox"]')
    expect(checkbox.element.tagName).toBe('INPUT')
    expect(checkbox.attributes('type')).toBe('checkbox')
    expect(checkbox.attributes('tabindex')).toBe('-1')
    expect(checkbox.attributes('aria-label')).toBe('Button')
    expect((itemByText(wrapper, 'README.md').find('input[type="checkbox"]').element as HTMLInputElement).disabled).toBe(true)
  })

  it('键盘 Enter：单次选中；键盘 Space（checkable）：单次级联勾选', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    await itemByText(wrapper, 'components').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('check')).toBeUndefined()
    await itemByText(wrapper, 'components').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('check')).toHaveLength(1)
    expect(wrapper.emitted('check')?.[0]?.[0]).toEqual(
      expect.objectContaining({ key: 'components', checked: true, checkedKeys: ['components', 'button', 'input'] }),
    )
  })

  it('非激活键（Tab、a）不触发选中/勾选/展开', async () => {
    const wrapper = mount(Tree, { props: { data, checkable: true } })
    const src = itemByText(wrapper, 'src')
    await src.trigger('keydown', { key: 'Tab' })
    await src.trigger('keydown', { key: 'a' })
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('check')).toBeUndefined()
    expect(wrapper.emitted('expand')).toBeUndefined()
    expect(src.attributes('aria-expanded')).toBe('true') // 状态未变
  })

  it('loading：ul 置 aria-busy="true"，骨架行 aria-hidden="true" 且无 treeitem', () => {
    const wrapper = mount(Tree, { props: { data, loading: true } })
    expect(wrapper.find('ul.ui-tree__list').attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('.ui-tree__item--skeleton')).toHaveLength(TREE_SKELETON_ROWS)
    for (const skeleton of wrapper.findAll('.ui-tree__item--skeleton')) {
      expect(skeleton.attributes('aria-hidden')).toBe('true')
    }
    expect(items(wrapper)).toHaveLength(0)
  })

  it('非 loading：ul 不出现 aria-busy', () => {
    const wrapper = mount(Tree, { props: { data } })
    expect(wrapper.find('ul.ui-tree__list').attributes('aria-busy')).toBeUndefined()
  })

  it('空态：无 role=tree、默认文案“暂无数据”，插槽覆盖生效', () => {
    const wrapper = mount(Tree, { props: { data: [] } })
    expect(wrapper.find('[role="tree"]').exists()).toBe(false)
    expect(wrapper.find('.ui-tree__empty').text()).toBe(TREE_EMPTY_TEXT_DEFAULT)
    const custom = mount(Tree, { props: { data: [] }, slots: { empty: () => '目录为空' } })
    expect(custom.find('.ui-tree__empty').text()).toBe('目录为空')
  })
})
