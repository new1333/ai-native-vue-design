/**
 * useCascader —— Cascader 的开合/面板推导/高亮/键盘状态机 composable（headless）。
 *
 * 收口级联选择的全部纯逻辑，不含任何 DOM / 浏览器 API：
 *   1. 开合状态（open）与高亮链（activeIndexes：每一层面板内的高亮下标）；开合
 *      受控模型收口于 shared useControllableOpen（propName 'open'）：传入 open
 *      prop 即受控——open 完全跟随外部值，内部开合路径只经 onOpenChange 上抛；
 *      缺省非受控内部自管理（onOpenChange 受控与非受控均上抛，语义同 popover/）；
 *      受控外部翻转 open（或初始即开）不经 openList，由开合沿 watch 补齐落位；
 *   2. 面板推导（panels）：根级面板 + 高亮链上每个含 children 节点的子面板
 *      （展开跟随高亮：高亮移动到无子级的节点时深层面板自动收起）；
 *   3. 导航：↓/↑ 当前面板内移动（跳过 disabled，两端夹住）与 Home/End 首尾的
 *      下标数学收口于 shared useListNavigation（可选集合 = 当前导航面板）；→ 进入
 *      子级、← 返回上级与多面板展开推导是级联特有逻辑，留在本文件；
 *   4. 提交出口：叶子提交路径并关闭（单选）/ 勾选路径（多选，弹层保持打开）；
 *      changeOnSelect 时父节点也可提交路径（单选，提交后仍展开下级）；
 *   5. 键盘状态机：Enter/Space 打开或提交、Esc 关闭，受理键一律 preventDefault。
 *
 * SSR 安全：不访问任何浏览器 API；KeyboardEvent 仅读取 key 并调用 preventDefault。
 */
import { computed, ref, toValue, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { useControllableOpen } from '../shared/useControllableOpen'
import { useListNavigation } from '../shared/useListNavigation'
import { CASCADER_NAVIGATION_KEYS } from './Cascader.constants'
import type { CascaderModelValue, CascaderOption, CascaderPath, CascaderValue } from './Cascader.types'

/** 高亮跳转的边缘。 */
export type CascaderNavigationEdge = 'first' | 'last'

/** 判定值是否为合法选项值（string | number）。 */
function isCascaderValue(value: unknown): value is CascaderValue {
  return typeof value === 'string' || typeof value === 'number'
}

/** 判定两条路径是否完全一致。 */
function samePath(a: CascaderPath, b: CascaderPath): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

/** useCascader 选项。 */
export interface UseCascaderOptions {
  /** 选项树根级数组来源（响应式）。 */
  options: MaybeRefOrGetter<CascaderOption[]>
  /** 受控当前值来源（响应式；null = 未选）。 */
  modelValue: MaybeRefOrGetter<CascaderModelValue>
  /**
   * 受控 open 来源（响应式）：传入 open prop 的 getter 即参与受控判定——受控探测
   * 由 shared useControllableOpen 按原始 vnode props 的 open / onUpdate:open 键
   * 存在性完成（Boolean prop 布尔转型不能凭值判空），受控时 open 完全跟随该值。
   */
  open?: MaybeRefOrGetter<boolean | undefined>
  /** open 变更出口（组件把 update:open 的 emit 挂到这里；受控与非受控均上抛）。 */
  onOpenChange?: (value: boolean) => void
  /** 多选模式（响应式）。 */
  multiple?: MaybeRefOrGetter<boolean>
  /** 选中任意层级（响应式）。 */
  changeOnSelect?: MaybeRefOrGetter<boolean>
  /** 禁用总闸（响应式）：一切开合/导航/选中路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean>
  /** 提交路径时的唯一出口回调（组件把 update:modelValue / change 的 emit 挂到这里）。 */
  onSelect: (value: CascaderPath | CascaderPath[]) => void
}

/** useCascader 返回值。 */
export interface UseCascaderReturn {
  /** 弹层是否打开（受控 = 外部 open 来源；非受控 = 内部状态）。 */
  open: ComputedRef<boolean>
  /** 高亮链：activeIndexes[i] 为第 i 层面板内的高亮下标（关闭时复位为空）。 */
  activeIndexes: Ref<number[]>
  /** 当前应渲染的面板列表：panels[0] 为根级，其后为高亮链上各节点的 children。 */
  panels: ComputedRef<CascaderOption[][]>
  /** 根级选项（panels[0]）。 */
  rootOptions: ComputedRef<CascaderOption[]>
  /** 已选且可解析的路径全集（单选至多一条；未选/值不可解析为空数组）。 */
  selectedPaths: ComputedRef<CascaderPath[]>
  /** 已选路径的 label 链（与 selectedPaths 一一对应）。 */
  displayLabels: ComputedRef<string[][]>
  /** 打开弹层：高亮落位为已选路径链，否则首个可选根项。 */
  openList: () => void
  /** 关闭弹层并复位高亮。 */
  closeList: () => void
  /** 开 <-> 关切换（disabled 拦截）。 */
  toggleList: () => void
  /** 当前面板内高亮移动 step 步：跳过 disabled，在可选集合两端夹住。 */
  moveActive: (step: 1 | -1) => void
  /** 当前面板内高亮跳到首个/末个可选选项。 */
  toEdge: (edge: CascaderNavigationEdge) => void
  /** 高亮节点有 children 时进入子级面板（高亮其首个可选子项）。 */
  expandActive: () => void
  /** 返回上级面板（高亮链去掉最后一层；子面板按高亮链推导保留/收起）。 */
  collapseActive: () => void
  /** 提交当前高亮节点：叶子提交/勾选，父节点按 changeOnSelect/multiple 决定提交或仅展开。 */
  commitActive: () => void
  /** 把高亮链截断到 depth 并落位 index（悬停展开/点击展开共用）。 */
  highlightAt: (depth: number, index: number) => void
  /** 根到 (depth, index) 节点的值路径。 */
  optionPath: (depth: number, index: number) => CascaderPath
  /** 节点是否为叶子（children 缺省或空数组）。 */
  isLeaf: (option: CascaderOption | null) => boolean
  /** (depth, index) 是否为键盘高亮位（仅当前导航面板的最后一个高亮）。 */
  isActive: (depth: number, index: number) => boolean
  /** 路径是否命中已选全集（含作为已选叶子祖先的贯穿命中）。 */
  isPathSelected: (path: CascaderPath) => boolean
  /** 多选下勾选/取消勾选一条叶子路径（非叶子/禁用/单选拦截）。 */
  togglePath: (path: CascaderPath) => void
  /** 点击选项的统一入口（展开/提交语义见实现）。 */
  onOptionClick: (depth: number, index: number) => void
  /**
   * 键盘状态机（绑定在触发器 keydown）：
   * 受理键一律 preventDefault（含 Space 滚动与原生 button 二次激活），其余键放行。
   */
  handleKeydown: (event: KeyboardEvent) => void
}

/** Cascader 开合/面板/高亮/键盘状态机（纯逻辑，无 DOM）。 */
export function useCascader(setup: UseCascaderOptions): UseCascaderReturn {
  /* ── 开合：受控（open / onUpdate:open 键存在）/非受控收口于 shared
     useControllableOpen；受控只上抛 onOpenChange，非受控上抛 + 内部落位 ── */
  const { isOpen: open, setOpen } = useControllableOpen({
    propName: 'open',
    modelValue: () => toValue(setup.open),
    onUpdate: (value) => setup.onOpenChange?.(value),
  })

  const activeIndexes = ref<number[]>([])

  const optionList = computed(() => toValue(setup.options) ?? [])
  const multiple = computed(() => toValue(setup.multiple) === true)
  const changeOnSelect = computed(() => toValue(setup.changeOnSelect) === true)
  const disabled = computed(() => toValue(setup.disabled) === true)

  function isLeaf(option: CascaderOption | null): boolean {
    return option === null || option.children === undefined || option.children.length === 0
  }

  /** 面板推导：展开跟随高亮链。 */
  const panels = computed<CascaderOption[][]>(() => {
    const list: CascaderOption[][] = [optionList.value]
    for (let depth = 0; depth < activeIndexes.value.length; depth++) {
      const node = list[depth]?.[activeIndexes.value[depth] ?? -1]
      if (node === undefined) break
      const children = node.children ?? []
      if (children.length === 0) break
      list.push(children)
    }
    return list
  })

  const rootOptions = computed(() => panels.value[0] ?? [])

  /** 沿选项树按路径逐层解析为下标链；中途断链（值不存在/父级无子级）返回 null。 */
  function resolveIndexes(path: CascaderPath): number[] | null {
    let list: CascaderOption[] = optionList.value
    const indexes: number[] = []
    for (let depth = 0; depth < path.length; depth++) {
      const index = list.findIndex((option) => option.value === path[depth])
      if (index === -1) return null
      indexes.push(index)
      if (depth < path.length - 1) {
        const children = list[index]?.children
        if (children === undefined || children.length === 0) return null
        list = children
      }
    }
    return indexes
  }

  const selectedPaths = computed<CascaderPath[]>(() => {
    const value = toValue(setup.modelValue)
    if (multiple.value) {
      if (!Array.isArray(value)) return []
      return value.filter(
        (path): path is CascaderPath =>
          Array.isArray(path) && path.length > 0 && path.every(isCascaderValue) && resolveIndexes(path) !== null,
      )
    }
    if (!Array.isArray(value) || value.length === 0 || !value.every(isCascaderValue)) return []
    const path = value as CascaderPath
    return resolveIndexes(path) === null ? [] : [path]
  })

  function labelsForPath(path: CascaderPath): string[] {
    const labels: string[] = []
    let list: CascaderOption[] = optionList.value
    for (const value of path) {
      const option = list.find((item) => item.value === value)
      if (option === undefined) {
        labels.push(String(value))
        break
      }
      labels.push(option.label)
      list = option.children ?? []
    }
    return labels
  }

  const displayLabels = computed<string[][]>(() => selectedPaths.value.map(labelsForPath))

/** 某一面板选项列表中非 disabled 选项的下标全集，导航只在其中移动。 */
function enabledIndexesOf(list: CascaderOption[]): number[] {
  return list.flatMap((option, index) => (option.disabled ? [] : [index]))
}

/**
 * 高亮导航引擎（shared useListNavigation）：可选集合 = 当前导航面板（高亮链尾层）
 * 的非禁用下标（链空 = 无当前面板，集合为空）；已选下标来源 = 链尾。↓/↑ 的步进
 * 数学与 Home/End 的端点跳转由引擎承担；面板间移动（→/←）与整链落位是级联特有
 * 逻辑，留在本文件。
 */
const navigation = useListNavigation({
  enabledIndexes: () => {
    const depth = activeIndexes.value.length - 1
    return depth < 0 ? [] : enabledIndexesOf(panels.value[depth] ?? [])
  },
  selectedIndex: () => activeIndexes.value[activeIndexes.value.length - 1] ?? -1,
})

/**
 * 高亮链整体落位（本 composable 内一切链变更的唯一入口）：写入链的同时把链尾
 * 同步给导航引擎，引擎的步进/端点数学始终以链尾为「当前高亮」。
 */
function applyIndexes(next: number[]): void {
  activeIndexes.value = next
  navigation.setActive(next[next.length - 1] ?? -1)
}

/** 把高亮链截断到 depth 并落位 index（更深的高亮随之丢弃，深层面板按推导收起/更新）。 */
function setIndex(depth: number, index: number): void {
  applyIndexes([...activeIndexes.value.slice(0, depth), index])
}

  /**
   * 打开落位：已选路径链优先（面板直接展示已选链），否则首个可选根项。落位是
   * 整链语义（引擎 initialActiveIndex 只做单层落位，不适配，见文件头）。
   */
  function locateOnOpen(): void {
    const seed = selectedPaths.value[0]
    const resolved = seed === undefined ? null : resolveIndexes(seed)
    if (resolved !== null && resolved.length > 0) {
      applyIndexes(resolved)
      return
    }
    const enabled = enabledIndexesOf(optionList.value)
    applyIndexes(enabled.length > 0 ? [enabled[0]] : [])
  }

  function openList(): void {
    if (disabled.value || open.value) return
    setOpen(true)
    locateOnOpen()
  }

  function closeList(): void {
    if (!open.value) return
    setOpen(false)
    applyIndexes([])
  }

  function toggleList(): void {
    if (open.value) closeList()
    else openList()
  }

  function moveActive(step: 1 | -1): void {
    const depth = activeIndexes.value.length - 1
    if (depth < 0) return
    // 步进数学（跳过 disabled、两端夹住、不环绕）收口于导航引擎，结果写回当前面板层。
    navigation.moveActive(step)
    setIndex(depth, navigation.activeIndex.value)
  }

  function toEdge(edge: CascaderNavigationEdge): void {
    const depth = activeIndexes.value.length - 1
    if (depth < 0) return
    navigation.toEdge(edge)
    setIndex(depth, navigation.activeIndex.value)
  }

  function expandActive(): void {
    const depth = activeIndexes.value.length - 1
    if (depth < 0) return
    const node = panels.value[depth]?.[activeIndexes.value[depth] ?? -1]
    if (node === undefined || isLeaf(node)) return
    // 子级落位为级联特有：全禁用时仍落 0（引擎 toEdge 在空集合 no-op，不适配）。
    const enabled = enabledIndexesOf(node.children ?? [])
    setIndex(depth + 1, enabled.length > 0 ? enabled[0] : 0)
  }

  function collapseActive(): void {
    if (activeIndexes.value.length <= 1) return
    applyIndexes(activeIndexes.value.slice(0, -1))
  }

  function highlightAt(depth: number, index: number): void {
    if (depth < 0 || index < 0) return
    setIndex(depth, index)
  }

  function optionPath(depth: number, index: number): CascaderPath {
    const path: CascaderPath = []
    for (let level = 0; level <= depth; level++) {
      const node =
        panels.value[level]?.[level === depth ? index : (activeIndexes.value[level] ?? -1)]
      if (node === undefined) break
      path.push(node.value)
    }
    return path
  }

  function isPathSelected(path: CascaderPath): boolean {
    return selectedPaths.value.some(
      (selected) => selected.length >= path.length && path.every((value, index) => selected[index] === value),
    )
  }

  function togglePath(path: CascaderPath): void {
    if (!multiple.value || path.length === 0) return
    // 仅叶子可勾选；路径不可解析或节点禁用一律拦截。
    let list: CascaderOption[] = optionList.value
    let node: CascaderOption | null = null
    for (const value of path) {
      node = list.find((item) => item.value === value) ?? null
      if (node === null) return
      list = node.children ?? []
    }
    if (node === null || !isLeaf(node) || node.disabled) return
    const exists = selectedPaths.value.some((selected) => samePath(selected, path))
    const next = exists
      ? selectedPaths.value.filter((selected) => !samePath(selected, path))
      : [...selectedPaths.value.map((selected) => selected.slice()), path.slice()]
    setup.onSelect(next)
  }

  function commitActive(): void {
    const depth = activeIndexes.value.length - 1
    if (depth < 0) return
    const index = activeIndexes.value[depth] ?? -1
    const node = panels.value[depth]?.[index]
    if (node === undefined || node.disabled) return
    const path = optionPath(depth, index)
    if (multiple.value) {
      // 多选：叶子勾选（弹层保持打开以便连续勾选），父节点仅展开。
      if (isLeaf(node)) togglePath(path)
      else expandActive()
      return
    }
    if (!isLeaf(node)) {
      // 单选父节点：changeOnSelect 时提交路径并继续展开，否则仅展开。
      if (changeOnSelect.value) setup.onSelect(path.slice())
      expandActive()
      return
    }
    setup.onSelect(path.slice())
    closeList()
  }

  function onOptionClick(depth: number, index: number): void {
    const node = panels.value[depth]?.[index]
    if (node === undefined || node.disabled) return
    highlightAt(depth, index)
    const path = optionPath(depth, index)
    if (isLeaf(node)) {
      if (multiple.value) togglePath(path)
      else {
        setup.onSelect(path.slice())
        closeList()
      }
      return
    }
    if (changeOnSelect.value && !multiple.value) setup.onSelect(path.slice())
    // 非叶子：展开由 highlightAt 后的 panels 推导完成。
  }

  /** 判定事件是否为状态机受理键。 */
  function isNavigationKey(key: string): boolean {
    return CASCADER_NAVIGATION_KEYS.includes(key)
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (disabled.value || !isNavigationKey(event.key)) return
    event.preventDefault()
    switch (event.key) {
      case 'ArrowDown':
        if (open.value) moveActive(1)
        else openList()
        break
      case 'ArrowUp':
        if (open.value) moveActive(-1)
        else openList()
        break
      case 'ArrowRight':
        if (open.value) expandActive()
        break
      case 'ArrowLeft':
        if (open.value) collapseActive()
        break
      case 'Home':
        if (open.value) toEdge('first')
        break
      case 'End':
        if (open.value) toEdge('last')
        break
      case 'Enter':
      case ' ':
        if (!open.value) openList()
        else commitActive()
        break
      case 'Escape':
        if (open.value) closeList()
        break
      default:
        break
    }
  }

  function isActive(depth: number, index: number): boolean {
    return depth === activeIndexes.value.length - 1 && activeIndexes.value[depth] === index
  }

  // 开合沿的高亮链同步：受控外部打开（open false→true，未经 openList）时同样落位
  // 高亮，保证弹层键盘可用；外部关闭复位高亮链。内部路径（openList/closeList）
  // 自行落位后此处空转（纯逻辑，SSR 安全）。
  watch(
    open,
    (isOpen) => {
      if (isOpen) {
        if (activeIndexes.value.length === 0) locateOnOpen()
      } else {
        applyIndexes([])
      }
    },
    { immediate: true },
  )

  return {
    open,
    activeIndexes,
    panels,
    rootOptions,
    selectedPaths,
    displayLabels,
    openList,
    closeList,
    toggleList,
    moveActive,
    toEdge,
    expandActive,
    collapseActive,
    commitActive,
    highlightAt,
    optionPath,
    isLeaf,
    isActive,
    isPathSelected,
    togglePath,
    onOptionClick,
    handleKeydown,
  }
}
