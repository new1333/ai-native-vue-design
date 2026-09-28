/**
 * useSelect —— Select 的开合/键盘状态机 composable（headless）。
 *
 * 收口单选下拉的组件差异逻辑，不含任何 DOM / 浏览器 API：
 *   1. 开合状态（open）与高亮下标（activeIndex，透传 shared 引擎）；
 *   2. 选中出口：select(index) → onSelect 回调（组件把 update:modelValue 挂这里）；
 *   3. 键盘状态机：Enter/Space 打开或选中、Esc 关闭，受理键一律 preventDefault。
 *
 * 高亮导航数学（↓/↑ 逐项移动跳过 disabled、Home/End 首尾、打开落位已选优先）
 * 收口于 shared 列表导航引擎 useListNavigation：本文件只按 Select 语义提供
 * enabledIndexes（disabled 闸门过滤）与 selectedIndex（已选下标，未选 -1），
 * 并透传引擎的 moveActive/toEdge/activeIndex 实现。
 *
 * SSR 安全：不访问任何浏览器 API；KeyboardEvent 仅读取 key 并调用 preventDefault。
 */
import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { useListNavigation } from '../shared/useListNavigation'
import { SELECT_NAVIGATION_KEYS } from './Select.constants'
import type { SelectOption, SelectValue } from './Select.types'

/** 高亮导航的方向/边缘。 */
export type SelectNavigationEdge = 'first' | 'last'

/** useSelect 选项。 */
export interface UseSelectOptions {
  /** 选项全集来源（响应式）。 */
  options: MaybeRefOrGetter<SelectOption[]>
  /** 受控当前值来源（响应式；null = 未选）。 */
  modelValue: MaybeRefOrGetter<SelectValue | null>
  /** 禁用总闸（响应式）：一切开合/导航/选中路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean>
  /** 选中某选项时的唯一出口回调（组件把 update:modelValue 的 emit 挂到这里）。 */
  onSelect?: (value: SelectValue) => void
}

/** useSelect 返回值。 */
export interface UseSelectReturn {
  /** 弹层是否打开。 */
  open: Ref<boolean>
  /** 当前高亮选项下标（-1 = 无高亮；关闭时复位）。 */
  activeIndex: Ref<number>
  /** 受控值命中的选项（null = 未选/未命中）。 */
  selectedOption: ComputedRef<SelectOption | null>
  /** 打开弹层；高亮落位 = 已选值优先，否则 edge 端首个可选选项。 */
  openList: (edge?: SelectNavigationEdge) => void
  /** 关闭弹层并复位高亮。 */
  closeList: () => void
  /** 开 <-> 关切换（disabled 拦截）。 */
  toggleList: () => void
  /** 选中指定下标的选项（disabled 选项忽略）并关闭。 */
  select: (index: number) => void
  /** 高亮移动 step 步：跳过 disabled 选项，在可选集合两端夹住。 */
  moveActive: (step: 1 | -1) => void
  /** 高亮跳到首个/末个可选选项。 */
  toEdge: (edge: SelectNavigationEdge) => void
  /**
   * 键盘状态机（绑定在触发器 keydown）：
   * 受理键一律 preventDefault（含 Space 滚动与原生 button 二次激活），其余键放行。
   */
  handleKeydown: (event: KeyboardEvent) => void
}

/** 判定事件是否为状态机受理键。 */
function isNavigationKey(key: string): boolean {
  return SELECT_NAVIGATION_KEYS.includes(key)
}

/** Select 开合/键盘状态机（纯逻辑，无 DOM）。 */
export function useSelect(options: UseSelectOptions): UseSelectReturn {
  const open = ref(false)

  const optionList = computed(() => toValue(options.options) ?? [])
  const disabled = computed(() => toValue(options.disabled) === true)

  const selectedOption = computed<SelectOption | null>(() => {
    const value = toValue(options.modelValue)
    if (value === null) return null
    return optionList.value.find((option) => option.value === value) ?? null
  })

  /** 可选（非 disabled）选项的下标全集，导航只在其中移动。 */
  const enabledIndexes = computed<number[]>(() =>
    optionList.value.flatMap((option, index) => (option.disabled ? [] : [index])),
  )

  // 高亮导航数学收口于 shared 列表导航引擎：enabledIndexes 为 Select 的禁用闸门
  // 过滤结果；selectedIndex 为已选选项下标（未选/未命中 -1），打开落位时优先。
  const { activeIndex, setActive, initialActiveIndex, moveActive, toEdge } = useListNavigation({
    enabledIndexes: () => enabledIndexes.value,
    selectedIndex: () => {
      const selected = selectedOption.value
      return selected === null ? -1 : optionList.value.indexOf(selected)
    },
  })

  function openList(edge: SelectNavigationEdge = 'first'): void {
    if (disabled.value || open.value) return
    open.value = true
    setActive(initialActiveIndex(edge))
  }

  function closeList(): void {
    if (!open.value) return
    open.value = false
    setActive(-1)
  }

  function toggleList(): void {
    if (open.value) closeList()
    else openList()
  }

  function select(index: number): void {
    const option = optionList.value[index]
    if (option === undefined || option.disabled === true) return
    options.onSelect?.(option.value)
    closeList()
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
      case 'Home':
        if (open.value) toEdge('first')
        break
      case 'End':
        if (open.value) toEdge('last')
        break
      case 'Enter':
      case ' ':
        if (!open.value) openList('first')
        else if (activeIndex.value >= 0) select(activeIndex.value)
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
    selectedOption,
    openList,
    closeList,
    toggleList,
    select,
    moveActive,
    toEdge,
    handleKeydown,
  }
}
