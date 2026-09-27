/**
 * useModelSelector —— ModelSelector 的开合/高亮/键盘状态机 composable（headless）。
 *
 * 与 Select 的 useSelect 同一套键盘与浮层纪律（WAI-ARIA combobox + listbox 弹出
 * 模式，aria-activedescendant 焦点模型），在此按 AI 模型切换的契约收口：
 *   1. 开合状态（open）与高亮下标（activeIndex）；
 *   2. 高亮导航：↓/↑ 逐项移动（跳过 disabled 模型，两端夹住）、Home/End 首尾；
 *   3. 打开落位：已选模型优先，否则首个（ArrowUp 打开时为末个）可选模型；
 *   4. 选中出口：select(index) → onSelect 回调上抛完整模型对象（组件把
 *      update:modelValue + change 挂到这里）；
 *   5. 加载闸门：loading 期间可选集合视为空（导航/选中一律 no-op），
 *      开合仍放行（弹层显示加载反馈）；
 *   6. 键盘状态机：Enter/Space 打开或选中、Esc 关闭，受理键一律 preventDefault。
 *
 * SSR 安全：不访问任何浏览器 API；KeyboardEvent 仅读取 key 并调用 preventDefault。
 */
import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { MODEL_SELECTOR_NAVIGATION_KEYS } from './ModelSelector.constants'
import type { ModelSelectorModel, ModelSelectorValue } from './ModelSelector.types'

/** 高亮导航的方向/边缘。 */
export type ModelSelectorNavigationEdge = 'first' | 'last'

/** useModelSelector 选项。 */
export interface UseModelSelectorOptions {
  /** 模型全集来源（响应式）。 */
  models: MaybeRefOrGetter<ModelSelectorModel[]>
  /** 受控当前值来源（响应式；null = 未选）。 */
  modelValue: MaybeRefOrGetter<ModelSelectorValue | null>
  /** 禁用总闸（响应式）：一切开合/导航/选中路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean>
  /** 加载闸门（响应式）：期间可选集合视为空，select 一律不上抛。 */
  loading?: MaybeRefOrGetter<boolean>
  /** 选中某模型时的唯一出口回调（组件把 update:modelValue + change 挂到这里）。 */
  onSelect?: (model: ModelSelectorModel) => void
}

/** useModelSelector 返回值。 */
export interface UseModelSelectorReturn {
  /** 弹层是否打开。 */
  open: Ref<boolean>
  /** 当前高亮模型下标（-1 = 无高亮；关闭时复位）。 */
  activeIndex: Ref<number>
  /** 受控值命中的模型（null = 未选/未命中）。 */
  selectedModel: ComputedRef<ModelSelectorModel | null>
  /** 打开弹层；高亮落位 = 已选模型优先，否则 edge 端首个可选模型。 */
  openList: (edge?: ModelSelectorNavigationEdge) => void
  /** 关闭弹层并复位高亮。 */
  closeList: () => void
  /** 开 <-> 关切换（disabled 拦截）。 */
  toggleList: () => void
  /** 选中指定下标的模型（disabled/loading 拦截）并关闭。 */
  select: (index: number) => void
  /** 高亮移动 step 步：跳过 disabled 模型，在可选集合两端夹住。 */
  moveActive: (step: 1 | -1) => void
  /** 高亮跳到首个/末个可选模型。 */
  toEdge: (edge: ModelSelectorNavigationEdge) => void
  /**
   * 键盘状态机（绑定在触发器 keydown）：
   * 受理键一律 preventDefault（含 Space 滚动与原生 button 二次激活），其余键放行。
   */
  handleKeydown: (event: KeyboardEvent) => void
}

/** 判定事件是否为状态机受理键。 */
function isNavigationKey(key: string): boolean {
  return MODEL_SELECTOR_NAVIGATION_KEYS.includes(key)
}

/** ModelSelector 开合/高亮/键盘状态机（纯逻辑，无 DOM）。 */
export function useModelSelector(options: UseModelSelectorOptions): UseModelSelectorReturn {
  const open = ref(false)
  const activeIndex = ref(-1)

  const modelList = computed(() => toValue(options.models) ?? [])
  const disabled = computed(() => toValue(options.disabled) === true)
  const loading = computed(() => toValue(options.loading) === true)

  const selectedModel = computed<ModelSelectorModel | null>(() => {
    const value = toValue(options.modelValue)
    if (value === null) return null
    return modelList.value.find((model) => model.value === value) ?? null
  })

  /** 可选（非 disabled、非加载中）模型的下标全集，导航只在其中移动。 */
  const enabledIndexes = computed<number[]>(() => {
    if (loading.value) return []
    return modelList.value.flatMap((model, index) => (model.disabled ? [] : [index]))
  })

  function isEnabled(index: number): boolean {
    const model = modelList.value[index]
    return model !== undefined && model.disabled !== true
  }

  /** 打开时的高亮落位：已选模型（若可选）优先，否则 edge 端首个可选。 */
  function initialActiveIndex(edge: ModelSelectorNavigationEdge): number {
    const selected = selectedModel.value
    if (selected !== null) {
      const selectedIndex = modelList.value.indexOf(selected)
      if (isEnabled(selectedIndex)) return selectedIndex
    }
    const enabled = enabledIndexes.value
    if (enabled.length === 0) return -1
    return edge === 'first' ? enabled[0] : enabled[enabled.length - 1]
  }

  function openList(edge: ModelSelectorNavigationEdge = 'first'): void {
    if (disabled.value || open.value) return
    open.value = true
    activeIndex.value = initialActiveIndex(edge)
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

  function select(index: number): void {
    // 加载闸门：与 Suggestion 同纪律，loading 拦截一切选中路径。
    if (loading.value) return
    const model = modelList.value[index]
    if (model === undefined || model.disabled === true) return
    options.onSelect?.(model)
    closeList()
  }

  function moveActive(step: 1 | -1): void {
    const enabled = enabledIndexes.value
    if (enabled.length === 0) return
    const current = enabled.indexOf(activeIndex.value)
    const next =
      current === -1
        ? step === 1
          ? 0
          : enabled.length - 1
        : Math.min(Math.max(current + step, 0), enabled.length - 1)
    activeIndex.value = enabled[next]
  }

  function toEdge(edge: ModelSelectorNavigationEdge): void {
    const enabled = enabledIndexes.value
    if (enabled.length === 0) return
    activeIndex.value = edge === 'first' ? enabled[0] : enabled[enabled.length - 1]
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
    selectedModel,
    openList,
    closeList,
    toggleList,
    select,
    moveActive,
    toEdge,
    handleKeydown,
  }
}
