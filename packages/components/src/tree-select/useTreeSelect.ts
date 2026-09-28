/**
 * useTreeSelect —— TreeSelect 的开合/展开/高亮/键盘状态机 composable（headless）
 * 与树扁平化、级联勾选的纯函数集合。
 *
 * 收口树形下拉的全部纯逻辑，不含任何 DOM / 浏览器 API：
 *   1. 开合状态（open）与高亮下标（activeIndex，指向可见扁平列表）——高亮状态与
 *      ↓/↑/Home/End 的下标数学收口于 shared useListNavigation；
 *   2. 展开集合（expanded）：→ 展开/进子级、← 折叠/回父级（树特有，留在本文件）；
 *   3. 高亮导航：↓/↑ 逐个可见节点移动（跳过 disabled，两端夹住）、Home/End 首尾
 *      （引擎 moveActive/toEdge，enabledIndexes = 可见且非有效禁用节点下标集）；
 *   4. 打开落位：树特有前置——展开已选值父链让其进入可见列表，已选下标（若可选）
 *      经引擎优先返回，否则 edge 端首个可选节点；
 *   5. 激活出口：onActivate 回调（组件把单选/多选/复选语义挂到这里），
 *      stayOpen=false（单选）时激活即关闭；
 *   6. 键盘状态机：Enter/Space 打开或激活、Esc 关闭，受理键一律 preventDefault。
 *
 * 级联勾选（checkable）纯函数：
 *   - 节点「勾选」= 其自身与全部可选后代都在勾选集合中（叶子即自身在集合中）；
 *   - 「半选」= 有可选后代在集合中但未全选；禁用节点只做展示、不参与级联；
 *   - 输入值归一化：父值自动展开到全部可选后代，输出按树的先序排列。
 *
 * SSR 安全：不访问任何浏览器 API；KeyboardEvent 仅读取 key 并调用 preventDefault。
 */
import { computed, ref, toValue } from 'vue'
import { useListNavigation } from '../shared/useListNavigation'
import { TREE_SELECT_NAVIGATION_KEYS } from './TreeSelect.constants'
import type {
  TreeSelectNavigationEdge,
  TreeSelectNodeRecord,
  TreeSelectNodeValue,
  TreeSelectOption,
  TreeSelectVisibleNode,
  UseTreeSelectOptions,
  UseTreeSelectReturn,
} from './TreeSelect.types'

/** 判定事件是否为状态机受理键。 */
function isNavigationKey(key: string): boolean {
  return TREE_SELECT_NAVIGATION_KEYS.includes(key)
}

/** 节点是否可展开：children 为非空数组。 */
export function isTreeSelectNodeExpandable(option: TreeSelectOption): boolean {
  return Array.isArray(option.children) && option.children.length > 0
}

/**
 * 构建整棵树的节点索引（value → 记录）。value 应在全树内唯一；
 * 重复 value 时后出现的覆盖先出现的（以调用方数据责任为主，组件不额外报错）。
 */
export function buildTreeSelectRecords(options: TreeSelectOption[]): Map<TreeSelectNodeValue, TreeSelectNodeRecord> {
  const records = new Map<TreeSelectNodeValue, TreeSelectNodeRecord>()
  const walk = (nodes: TreeSelectOption[], parent: TreeSelectOption | null, level: number): void => {
    for (const option of nodes) {
      records.set(option.value, { option, parent, level })
      if (isTreeSelectNodeExpandable(option)) walk(option.children ?? [], option, level + 1)
    }
  }
  walk(options, null, 1)
  return records
}

/** 按展开状态派生可见节点扁平列表（先序遍历；未展开的子树不出现）。 */
export function collectVisibleTreeNodes(
  options: TreeSelectOption[],
  expanded: ReadonlySet<TreeSelectNodeValue>,
): TreeSelectVisibleNode[] {
  const visible: TreeSelectVisibleNode[] = []
  const walk = (nodes: TreeSelectOption[], level: number): void => {
    for (const option of nodes) {
      const expandable = isTreeSelectNodeExpandable(option)
      visible.push({ option, level, expandable })
      if (expandable && expanded.has(option.value)) walk(option.children ?? [], level + 1)
    }
  }
  walk(options, 1)
  return visible
}

/** 收集节点子树内全部「可选」（非 disabled）值，含自身（自身禁用则不含，其子树一并排除）。 */
export function collectTreeSelectSelectableValues(option: TreeSelectOption): TreeSelectNodeValue[] {
  const values: TreeSelectNodeValue[] = []
  const walk = (node: TreeSelectOption): void => {
    if (node.disabled === true) return
    values.push(node.value)
    if (isTreeSelectNodeExpandable(node)) for (const child of node.children ?? []) walk(child)
  }
  walk(option)
  return values
}

/**
 * 节点「有效禁用」：自身 disabled，或任一祖先 disabled（子树随父失效）。
 * 有效禁用节点不可被点击选中/键盘命中/级联勾选。
 */
export function isTreeSelectNodeEffectivelyDisabled(
  option: TreeSelectOption,
  records: ReadonlyMap<TreeSelectNodeValue, TreeSelectNodeRecord>,
): boolean {
  if (option.disabled === true) return true
  let parent = records.get(option.value)?.parent ?? null
  while (parent !== null) {
    if (parent.disabled === true) return true
    parent = records.get(parent.value)?.parent ?? null
  }
  return false
}

/** 节点是否勾选：自身与全部可选后代都在勾选集合中（禁用节点仅回显集合成员资格）。 */
export function isTreeSelectNodeChecked(
  option: TreeSelectOption,
  checked: ReadonlySet<TreeSelectNodeValue>,
): boolean {
  if (option.disabled === true) return checked.has(option.value)
  const targets = collectTreeSelectSelectableValues(option)
  return targets.length > 0 && targets.every((value) => checked.has(value))
}

/** 节点是否半选（仅对带可选后代的非禁用节点有意义）。 */
export function isTreeSelectNodeIndeterminate(
  option: TreeSelectOption,
  checked: ReadonlySet<TreeSelectNodeValue>,
): boolean {
  if (option.disabled === true || !isTreeSelectNodeExpandable(option)) return false
  const targets = collectTreeSelectSelectableValues(option)
  let count = 0
  for (const value of targets) if (checked.has(value)) count += 1
  return count > 0 && count < targets.length
}

/** 归一化勾选输入：每个输入值展开为「自身 + 全部可选后代」并并入集合。 */
export function normalizeTreeSelectCheckedInput(
  options: TreeSelectOption[],
  values: readonly TreeSelectNodeValue[],
): Set<TreeSelectNodeValue> {
  const records = buildTreeSelectRecords(options)
  const checked = new Set<TreeSelectNodeValue>()
  for (const value of values) {
    checked.add(value)
    const record = records.get(value)
    if (record !== undefined) {
      for (const target of collectTreeSelectSelectableValues(record.option)) checked.add(target)
    }
  }
  return checked
}

/**
 * 计算级联勾选的输出值集：树的先序遍历，收集全部「非有效禁用且勾选」节点值。
 * 父节点仅在其全部可选后代都勾选时包含（与 isTreeSelectNodeChecked 一致）；
 * disabled 节点的子树随父排除。
 */
export function computeTreeSelectCheckedValues(
  options: TreeSelectOption[],
  checked: ReadonlySet<TreeSelectNodeValue>,
): TreeSelectNodeValue[] {
  const values: TreeSelectNodeValue[] = []
  const walk = (nodes: TreeSelectOption[], ancestorDisabled: boolean): void => {
    for (const option of nodes) {
      const effectivelyDisabled = ancestorDisabled || option.disabled === true
      if (!effectivelyDisabled && isTreeSelectNodeChecked(option, checked)) values.push(option.value)
      if (isTreeSelectNodeExpandable(option)) walk(option.children ?? [], effectivelyDisabled)
    }
  }
  walk(options, false)
  return values
}

/**
 * TreeSelect 开合/展开/高亮/键盘状态机（纯逻辑，无 DOM）。
 * 选中/勾选语义由组件通过 onActivate 挂载；本 composable 只负责树导航与开合。
 */
export function useTreeSelect(config: UseTreeSelectOptions): UseTreeSelectReturn {
  const open = ref(false)
  const expanded = ref<ReadonlySet<TreeSelectNodeValue>>(new Set())

  const optionTree = computed(() => toValue(config.options) ?? [])
  const disabled = computed(() => toValue(config.disabled) === true)
  const stayOpen = computed(() => toValue(config.stayOpen) === true)
  const records = computed(() => buildTreeSelectRecords(optionTree.value))
  const visibleNodes = computed(() => collectVisibleTreeNodes(optionTree.value, expanded.value))

  /** 可选（非有效禁用）可见节点的下标全集，导航只在其中移动。 */
  const enabledIndexes = computed<number[]>(() =>
    visibleNodes.value.flatMap((node, index) =>
      isTreeSelectNodeEffectivelyDisabled(node.option, records.value) ? [] : [index],
    ),
  )

  function isEnabled(index: number): boolean {
    const node = visibleNodes.value[index]
    return (
      node !== undefined && !isTreeSelectNodeEffectivelyDisabled(node.option, records.value)
    )
  }

  // 高亮下标状态与无差异的下标数学（逐项移动/边缘跳转/打开落位「已选优先，否则
  // 端点」）收口于 shared 导航引擎；树特有逻辑（父链展开落位、→/← 进出层级、
  // 激活出口、展开集合推导）仍留在本文件。
  const navigation = useListNavigation({
    enabledIndexes: () => enabledIndexes.value,
    selectedIndex: () => primaryVisibleIndex(),
  })
  const { activeIndex, moveActive, toEdge } = navigation

  function expand(value: TreeSelectNodeValue): void {
    if (!expanded.value.has(value)) expanded.value = new Set([...expanded.value, value])
  }

  function collapse(value: TreeSelectNodeValue): void {
    if (expanded.value.has(value)) {
      const next = new Set([...expanded.value])
      next.delete(value)
      expanded.value = next
    }
  }

  function toggleExpand(value: TreeSelectNodeValue): void {
    if (expanded.value.has(value)) collapse(value)
    else expand(value)
  }

  /** 打开落位参考：已选值（若可见且可选）在可见扁平列表中的下标；否则 -1。 */
  function primaryVisibleIndex(): number {
    const primary = toValue(config.primaryValue) ?? null
    if (primary === null) return -1
    const index = visibleNodes.value.findIndex((node) => node.option.value === primary)
    return isEnabled(index) ? index : -1
  }

  /** 树特有落位前置：展开已选节点父链，让已选节点进入可见列表（展开状态持久，关闭再开不丢失）。 */
  function expandAncestorsOfPrimary(): void {
    const primary = toValue(config.primaryValue) ?? null
    if (primary === null) return
    const record = records.value.get(primary)
    if (record === undefined) return
    let ancestor = record.parent
    while (ancestor !== null) {
      expand(ancestor.value)
      ancestor = records.value.get(ancestor.value)?.parent ?? null
    }
  }

  function openList(edge: TreeSelectNavigationEdge = 'first'): void {
    if (disabled.value || open.value) return
    expandAncestorsOfPrimary()
    open.value = true
    activeIndex.value = navigation.initialActiveIndex(edge)
  }

  function closeList(): void {
    if (!open.value) return
    open.value = false
    activeIndex.value = -1
  }

  function toggleList(): void {
    if (open.value) closeList()
    else openList()
  }

  /** 高亮进入活动节点的首个可见子节点（仅当其已展开且子节点紧随其后）。 */
  function moveIntoFirstChild(): void {
    const node = visibleNodes.value[activeIndex.value]
    if (node === undefined) return
    const child = visibleNodes.value[activeIndex.value + 1]
    if (child !== undefined && child.level === node.level + 1) activeIndex.value += 1
  }

  /** 高亮移动到活动节点的父节点（向前找最近的 level-1 节点）；根节点不动。 */
  function moveToParent(): void {
    const node = visibleNodes.value[activeIndex.value]
    if (node === undefined || node.level <= 1) return
    for (let index = activeIndex.value - 1; index >= 0; index -= 1) {
      if (visibleNodes.value[index]?.level === node.level - 1) {
        activeIndex.value = index
        return
      }
    }
  }

  /** 激活当前高亮节点：走 onActivate 出口；单选（非 stayOpen）随后关闭。 */
  function activateActive(): void {
    const node = visibleNodes.value[activeIndex.value]
    if (
      node === undefined ||
      isTreeSelectNodeEffectivelyDisabled(node.option, records.value)
    ) {
      return
    }
    config.onActivate?.(node.option)
    if (!stayOpen.value) closeList()
  }

  /** → 展开活动节点；已展开则进入首个子节点。 */
  function moveRight(): void {
    const node = visibleNodes.value[activeIndex.value]
    if (node === undefined || !node.expandable) return
    if (expanded.value.has(node.option.value)) moveIntoFirstChild()
    else expand(node.option.value)
  }

  /** ← 折叠活动节点；已折叠（或叶子）则回到父节点。 */
  function moveLeft(): void {
    const node = visibleNodes.value[activeIndex.value]
    if (node === undefined) return
    if (node.expandable && expanded.value.has(node.option.value)) collapse(node.option.value)
    else moveToParent()
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (disabled.value || !isNavigationKey(event.key)) return
    event.preventDefault()
    switch (event.key) {
      case 'ArrowDown':
        if (open.value) moveActive(1)
        else openList('first')
        break
      case 'ArrowUp':
        if (open.value) moveActive(-1)
        else openList('last')
        break
      case 'ArrowRight':
        if (open.value) moveRight()
        break
      case 'ArrowLeft':
        if (open.value) moveLeft()
        break
      case 'Home':
        if (open.value) toEdge('first')
        break
      case 'End':
        if (open.value) toEdge('last')
        break
      case 'Enter':
      case ' ':
        if (!open.value) openList('first')
        else activateActive()
        break
      case 'Escape':
        if (open.value) closeList()
        break
      default:
        break
    }
  }

  return {
    open,
    activeIndex,
    expanded,
    visibleNodes,
    records,
    expand,
    collapse,
    toggleExpand,
    openList,
    closeList,
    toggleList,
    moveActive,
    toEdge,
    moveIntoFirstChild,
    moveToParent,
    handleKeydown,
  }
}
