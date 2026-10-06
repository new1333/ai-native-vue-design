/**
 * useTree —— Tree 的状态机 composable（headless）。
 *
 * 收口三类语义：
 *   1. 展开/折叠：expandedKeys 受控（传入 prop）或非受控（内部状态，初始展开全部父节点）；
 *   2. 选中：modelValue 受控或非受控；单选重复点击不取消，多选点击切换；
 *   3. 勾选：checkedKeys 受控（传入 prop）或非受控（内部状态，可用
 *      defaultCheckedKeys 初始化）+ 级联（勾/取消父节点传播到全部可用后代，
 *      祖先按“可用子节点是否全勾”回算；禁用节点不入集合、不参与级联）。
 *
 * 渲染模型：visibleNodes 把“展开路径上的节点”扁平化（aria-level/posinset/setsize
 * 随行携带），键盘 ↑↓ 在该顺序上移动焦点，←→ 折叠/展开或在层级间跳转；
 * 导航落点一律跳过禁用节点（焦点不落在禁用 treeitem 上，激活路径另有守卫）。
 *
 * SSR 安全：不访问任何浏览器 API；只做纯数据推导（Map/Set/array）。
 */
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import type {
  TreeCheckPayload,
  TreeExpandPayload,
  TreeFlatNode,
  TreeNavigationEdge,
  TreeNode,
  TreeSelectPayload,
  TreeValue,
} from './Tree.types'

/** useTree 选项（均为响应式 getter，供 Tree.vue 传 props）。 */
export interface UseTreeOptions {
  /** 嵌套树数据（响应式来源；只读消费）。 */
  data: () => TreeNode[]
  /** 展开键 prop（undefined 表示非受控）。 */
  expandedKeys: () => string[] | undefined
  /** 勾选键 prop（undefined 表示非受控）。 */
  checkedKeys: () => string[] | undefined
  /** 非受控初始勾选键（仅初始化消费一次）。 */
  defaultCheckedKeys: () => string[] | undefined
  /** 选中值 prop（undefined 表示非受控）。 */
  modelValue: () => TreeValue | undefined
  /** 是否多选。 */
  multiple: () => boolean
  /** 选中变化回调（发出 select 事件）。 */
  onSelect: (payload: TreeSelectPayload) => void
  /** 勾选变化回调（发出 check 事件）。 */
  onCheck: (payload: TreeCheckPayload) => void
  /** 展开折叠回调（发出 expand 事件）。 */
  onExpand: (payload: TreeExpandPayload) => void
  /** 勾选键集合变化回调（发出 update:checkedKeys 事件）。 */
  onUpdateCheckedKeys: (value: string[]) => void
  /** 选中值变化回调（发出 update:modelValue 事件）。 */
  onUpdateModelValue: (value: TreeValue) => void
}

/** useTree 返回值。 */
export interface UseTreeReturn {
  /** 可见节点（扁平、先序；折叠子树不出现）。 */
  visibleNodes: ComputedRef<TreeFlatNode[]>
  /** 当前应持有 tabindex=0 的节点键（roving tabindex；无节点时 null）。 */
  tabbableKey: ComputedRef<string | null>
  /** 节点是否展开。 */
  isExpanded: (key: string) => boolean
  /** 节点是否有子节点。 */
  hasChildren: (key: string) => boolean
  /** 节点是否选中。 */
  isSelected: (key: string) => boolean
  /** 节点是否勾选。 */
  isChecked: (key: string) => boolean
  /** 节点是否半选（子节点部分勾选）。 */
  isIndeterminate: (key: string) => boolean
  /** 记录焦点落在哪个节点（roving tabindex 源）。 */
  setActiveKey: (key: string) => void
  /** 键盘导航（↑/↓）：自 fromIndex（不含）沿 step 方向最近的可用（非禁用）可见节点键；无则 null（两端不环绕）。 */
  nextEnabledKey: (fromIndex: number, step: 1 | -1) => string | null
  /** 键盘导航（Home/End）：首个/最后一个可用（非禁用）可见节点键；无可用节点返回 null。 */
  edgeEnabledKey: (edge: TreeNavigationEdge) => string | null
  /** 键盘导航（→ 下钻）：先序中紧随 parentIndex、层级为 childLevel 的连续子级区段内，首个可用子节点键；无则 null。 */
  firstEnabledChildKey: (parentIndex: number, childLevel: number) => string | null
  /** 键盘导航（← 上溯）：最近的可用（非禁用）可见祖先键（可见节点的祖先必可见）；根节点或祖先均不可用返回 null。 */
  nearestEnabledAncestorKey: (key: string) => string | null
  /** 切换展开折叠（叶子为 no-op）。 */
  toggleExpand: (node: TreeNode) => void
  /** 切换选中（禁用为 no-op；单选重复点击不取消）。 */
  toggleSelect: (node: TreeNode) => void
  /** 设置勾选状态（级联后代 + 回算祖先；禁用为 no-op）。 */
  setChecked: (node: TreeNode, next: boolean) => void
}

/** 节点元信息：父键与子键（级联/祖先回算用，含不可见节点）。 */
interface TreeNodeMeta {
  node: TreeNode
  parentKey: string | null
  childKeys: string[]
}

/** 归一化选中值：multiple 模式存 string[]，single 模式取首个（或空）。 */
function normalizeSelectedValue(value: TreeValue, multiple: boolean): string[] {
  if (multiple) return Array.isArray(value) ? value : [value]
  if (Array.isArray(value)) return value.length > 0 ? [value[0]] : []
  return [value]
}

/** 是否父节点（children 非空数组）。 */
function hasChildNodes(node: TreeNode): boolean {
  return (node.children?.length ?? 0) > 0
}

/** Tree 状态机 composable。 */
export function useTree(options: UseTreeOptions): UseTreeReturn {
  // ── 节点元信息：key → { node, parentKey, childKeys }（含不可见节点）────
  const nodeMeta = computed<Map<string, TreeNodeMeta>>(() => {
    const map = new Map<string, TreeNodeMeta>()
    const walk = (nodes: TreeNode[], parentKey: string | null): void => {
      for (const node of nodes) {
        map.set(node.key, {
          node,
          parentKey,
          childKeys: (node.children ?? []).map((child) => child.key),
        })
        if (node.children?.length) walk(node.children, node.key)
      }
    }
    walk(options.data(), null)
    return map
  })

  /** 按树的先序收集集合内的键（保证 emit 快照顺序确定）。 */
  const orderedKeysIn = (set: Set<string>): string[] => {
    const keys: string[] = []
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        if (set.has(node.key)) keys.push(node.key)
        if (node.children?.length) walk(node.children)
      }
    }
    walk(options.data())
    return keys
  }

  // ── 展开/折叠 ───────────────────────────────────────────────
  // 非受控初始值：展开全部父节点（仅初始化一次，后续 data 追加不回填）。
  const collectInitialExpandedKeys = (): string[] => {
    const keys: string[] = []
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        if (hasChildNodes(node)) {
          keys.push(node.key)
          if (node.children?.length) walk(node.children)
        }
      }
    }
    walk(options.data())
    return keys
  }
  const innerExpandedKeys = ref<string[]>(collectInitialExpandedKeys())

  const isExpandControlled = computed(() => options.expandedKeys() !== undefined)

  const expandedSet = computed<Set<string>>(() => {
    const value = options.expandedKeys()
    return new Set(value !== undefined ? value : innerExpandedKeys.value)
  })

  // ── 选中 ────────────────────────────────────────────────────
  const innerSelectedKeys = ref<string[]>([])
  const isSelectControlled = computed(() => options.modelValue() !== undefined)

  const selectedSet = computed<Set<string>>(() => {
    const value = options.modelValue()
    const list =
      value === undefined
        ? innerSelectedKeys.value
        : normalizeSelectedValue(value, options.multiple())
    return new Set(list)
  })

  // ── 勾选（受控 checkedKeys / 非受控内部状态；级联语义见文件头注释）──
  /** 子树内所有非禁用节点加入/移出集合（禁用节点阻断其子树的级联）。 */
  const applySubtree = (node: TreeNode, set: Set<string>, add: boolean): void => {
    if (node.disabled) return
    if (add) set.add(node.key)
    else set.delete(node.key)
    for (const child of node.children ?? []) applySubtree(child, set, add)
  }

  /** 祖先回算：可用子节点全勾 → 勾上祖先；否则取消（禁用祖先不入集合）。 */
  const recomputeAncestors = (set: Set<string>, key: string): void => {
    let current = nodeMeta.value.get(key)?.parentKey ?? null
    while (current !== null) {
      const meta = nodeMeta.value.get(current)
      if (!meta) break
      const enabledChildren = (meta.node.children ?? []).filter((child) => !child.disabled)
      if (enabledChildren.length > 0 && !meta.node.disabled) {
        if (enabledChildren.every((child) => set.has(child.key))) set.add(current)
        else set.delete(current)
      }
      current = meta.parentKey
    }
  }

  /** 非受控初始勾选键：defaultCheckedKeys 过滤禁用/不存在键后回算祖先（仅初始化一次）。 */
  const collectInitialCheckedKeys = (): string[] => {
    const defaults = options.defaultCheckedKeys()
    if (!defaults || defaults.length === 0) return []
    const set = new Set<string>()
    for (const key of defaults) {
      const meta = nodeMeta.value.get(key)
      if (meta && !meta.node.disabled) set.add(key)
    }
    for (const key of [...set]) recomputeAncestors(set, key)
    return orderedKeysIn(set)
  }
  const innerCheckedKeys = ref<string[]>(collectInitialCheckedKeys())

  const isCheckControlled = computed(() => options.checkedKeys() !== undefined)

  const checkedSet = computed<Set<string>>(() => {
    const value = options.checkedKeys()
    return new Set(value !== undefined ? value : innerCheckedKeys.value)
  })

  /** 半选集合：有可用子节点、自身未勾、但后代有勾选。 */
  const indeterminateMap = computed<Map<string, boolean>>(() => {
    const checked = checkedSet.value
    const map = new Map<string, boolean>()
    const walkNode = (node: TreeNode): { any: boolean; all: boolean } => {
      const enabledChildren = (node.children ?? []).filter((child) => !child.disabled)
      if (enabledChildren.length === 0) {
        const self = checked.has(node.key)
        return { any: self, all: self }
      }
      let any = false
      let all = true
      for (const child of enabledChildren) {
        const result = walkNode(child)
        if (result.any) any = true
        if (!result.all) all = false
      }
      const self = checked.has(node.key)
      map.set(node.key, !self && any && !all)
      return { any: any || self, all: all && self }
    }
    for (const root of options.data()) walkNode(root)
    return map
  })

  // ── 可见节点（渲染模型）─────────────────────────────────────
  const visibleNodes = computed<TreeFlatNode[]>(() => {
    const expanded = expandedSet.value
    const out: TreeFlatNode[] = []
    const walk = (nodes: TreeNode[], level: number, parentKey: string | null): void => {
      nodes.forEach((node, i) => {
        const isExpanded = hasChildNodes(node) && expanded.has(node.key)
        out.push({
          node,
          key: node.key,
          level,
          parentKey,
          hasChildren: hasChildNodes(node),
          expanded: isExpanded,
          posInSet: i + 1,
          setSize: nodes.length,
          index: out.length,
        })
        if (isExpanded) walk(node.children ?? [], level + 1, node.key)
      })
    }
    walk(options.data(), 1, null)
    return out
  })

  // ── roving tabindex ────────────────────────────────────────
  const activeKey = ref<string | null>(null)
  const visibleKeys = computed<Set<string>>(() => new Set(visibleNodes.value.map((flat) => flat.key)))
  const tabbableKey = computed<string | null>(() => {
    if (activeKey.value !== null && visibleKeys.value.has(activeKey.value)) return activeKey.value
    return visibleNodes.value[0]?.key ?? null
  })

  // ── 键盘导航落点（一律跳过禁用节点；两端不环绕，无可用目标不移动）──
  /** 自 fromIndex（不含）沿 step 方向最近的可用（非禁用）可见节点键；无则 null。 */
  function nextEnabledKey(fromIndex: number, step: 1 | -1): string | null {
    const nodes = visibleNodes.value
    for (let i = fromIndex + step; i >= 0 && i < nodes.length; i += step) {
      if (!nodes[i].node.disabled) return nodes[i].key
    }
    return null
  }

  /** Home/End：首个/最后一个可用（非禁用）可见节点键；无可用节点返回 null。 */
  function edgeEnabledKey(edge: TreeNavigationEdge): string | null {
    return nextEnabledKey(
      edge === 'first' ? -1 : visibleNodes.value.length,
      edge === 'first' ? 1 : -1,
    )
  }

  /** → 下钻：先序中紧随 parentIndex、层级为 childLevel 的连续子级区段内，首个可用子节点键；无则 null。 */
  function firstEnabledChildKey(parentIndex: number, childLevel: number): string | null {
    const nodes = visibleNodes.value
    for (let i = parentIndex + 1; i < nodes.length && nodes[i].level === childLevel; i++) {
      if (!nodes[i].node.disabled) return nodes[i].key
    }
    return null
  }

  /** ← 上溯：最近的可用（非禁用）可见祖先键（沿父链上溯，跳过禁用祖先）；根节点或祖先均不可用返回 null。 */
  function nearestEnabledAncestorKey(key: string): string | null {
    let current = nodeMeta.value.get(key)?.parentKey ?? null
    while (current !== null) {
      const meta = nodeMeta.value.get(current)
      if (meta && visibleKeys.value.has(current) && !meta.node.disabled) return current
      current = meta?.parentKey ?? null
    }
    return null
  }

  // ── 动作 ───────────────────────────────────────────────────
  const isExpanded = (key: string): boolean => expandedSet.value.has(key)
  const hasChildren = (key: string): boolean => {
    const node = nodeMeta.value.get(key)?.node
    return node !== undefined && hasChildNodes(node)
  }
  const isSelected = (key: string): boolean => selectedSet.value.has(key)
  const isChecked = (key: string): boolean => checkedSet.value.has(key)
  const isIndeterminate = (key: string): boolean => indeterminateMap.value.get(key) ?? false

  function setActiveKey(key: string): void {
    activeKey.value = key
  }

  function toggleExpand(node: TreeNode): void {
    if (!hasChildNodes(node)) return
    const expandedNow = expandedSet.value.has(node.key)
    const nextSet = new Set(expandedSet.value)
    if (expandedNow) nextSet.delete(node.key)
    else nextSet.add(node.key)
    const nextKeys = orderedKeysIn(nextSet)
    if (!isExpandControlled.value) innerExpandedKeys.value = nextKeys
    options.onExpand({ key: node.key, node, expanded: !expandedNow, expandedKeys: nextKeys })
  }

  function toggleSelect(node: TreeNode): void {
    if (node.disabled) return
    const selected = selectedSet.value.has(node.key)
    if (!options.multiple() && selected) return // 单选重复点击不取消
    let next: string[]
    if (options.multiple()) {
      const current = [...selectedSet.value]
      next = selected ? current.filter((key) => key !== node.key) : [...current, node.key]
    } else {
      next = [node.key]
    }
    if (!isSelectControlled.value) innerSelectedKeys.value = next
    options.onUpdateModelValue(options.multiple() ? next : (next[0] ?? node.key))
    options.onSelect({ key: node.key, node, selected: !selected })
  }

  function setChecked(node: TreeNode, next: boolean): void {
    if (node.disabled) return
    // 级联基于当前集合（受控时即 props 快照）重算，得到全量下一个状态。
    const set = new Set(checkedSet.value)
    applySubtree(node, set, next)
    recomputeAncestors(set, node.key)
    const nextKeys = orderedKeysIn(set)
    if (!isCheckControlled.value) innerCheckedKeys.value = nextKeys
    options.onUpdateCheckedKeys(nextKeys)
    options.onCheck({ key: node.key, node, checked: next, checkedKeys: nextKeys })
  }

  return {
    visibleNodes,
    tabbableKey,
    isExpanded,
    hasChildren,
    isSelected,
    isChecked,
    isIndeterminate,
    setActiveKey,
    nextEnabledKey,
    edgeEnabledKey,
    firstEnabledChildKey,
    nearestEnabledAncestorKey,
    toggleExpand,
    toggleSelect,
    setChecked,
  }
}
