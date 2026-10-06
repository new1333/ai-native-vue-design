/**
 * useModelSelector —— ModelSelector 的开合/高亮/键盘状态机 composable（headless）。
 *
 * 与 Select 同一套键盘与浮层纪律（WAI-ARIA combobox + listbox 弹出模式，
 * aria-activedescendant 焦点模型），在此按 AI 模型切换的契约收口：
 *   1. 开合状态（open）与高亮下标（activeIndex）；开合受控模型收口于 shared
 *      useControllableOpen（propName 'open'）：传入 open prop 即受控——open 完全
 *      跟随外部值，内部开合路径只经 onOpenChange 上抛；缺省非受控内部自管理
 *      （onOpenChange 受控与非受控均上抛，语义同 popover/ 的 v-model:modelValue）；
 *   2. 高亮导航：↓/↑ 逐项移动（跳过 disabled 模型，两端夹住）、Home/End 首尾；
 *   3. 打开落位：已选模型优先，否则首个（ArrowUp 打开时为末个）可选模型；
 *   4. 选中出口：select(index) → onSelect 回调上抛完整模型对象（组件把
 *      update:modelValue + change 挂到这里）；
 *   5. 加载闸门：loading 期间可选集合视为空（导航/选中一律 no-op），
 *      开合仍放行（弹层显示加载反馈）；
 *   6. 键盘状态机：Enter/Space 打开或选中、Esc 关闭，受理键一律 preventDefault。
 *
 * 高亮下标数学（逐项移动/首尾跳转/打开落位）已收口于 shared useListNavigation；
 * 本文件持有 ModelSelector 特有契约：loading/disabled 闸门（enabledIndexes 过滤
 * 与 select 拦截）与键盘状态机。弹层定位与外点关闭由 SFC 侧 shared
 * useFloatingLayer（dropdown 策略）承担。
 *
 * SSR 安全：不访问任何浏览器 API；KeyboardEvent 仅读取 key 并调用 preventDefault。
 */
import { computed, toValue, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { useControllableOpen } from '../shared/useControllableOpen'
import { useListNavigation } from '../shared/useListNavigation'
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
  /**
   * 受控 open 来源（响应式）：传入 open prop 的 getter 即参与受控判定——受控探测
   * 由 shared useControllableOpen 按原始 vnode props 的 open / onUpdate:open 键
   * 存在性完成（Boolean prop 布尔转型不能凭值判空），受控时 open 完全跟随该值。
   */
  open?: MaybeRefOrGetter<boolean | undefined>
  /** open 变更出口（组件把 update:open 的 emit 挂到这里；受控与非受控均上抛）。 */
  onOpenChange?: (value: boolean) => void
  /** 禁用总闸（响应式）：一切开合/导航/选中路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean>
  /** 加载闸门（响应式）：期间可选集合视为空，select 一律不上抛。 */
  loading?: MaybeRefOrGetter<boolean>
  /** 选中某模型时的唯一出口回调（组件把 update:modelValue + change 挂到这里）。 */
  onSelect?: (model: ModelSelectorModel) => void
}

/** useModelSelector 返回值。 */
export interface UseModelSelectorReturn {
  /** 弹层是否打开（受控 = 外部 open 来源；非受控 = 内部状态）。 */
  open: ComputedRef<boolean>
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
  /* ── 开合：受控（open / onUpdate:open 键存在）/非受控收口于 shared
     useControllableOpen；受控只上抛 onOpenChange，非受控上抛 + 内部落位 ── */
  const { isOpen: open, setOpen } = useControllableOpen({
    propName: 'open',
    modelValue: () => toValue(options.open),
    onUpdate: (value) => options.onOpenChange?.(value),
  })

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

  /* 高亮下标数学收口于 shared useListNavigation：loading 闸门过滤保留在本侧
     computed 后以 enabledIndexes 传入；已选下标（未选/未命中为 -1）作打开落位
     优先来源（engine 侧判定其是否仍在可选集合内）。 */
  const { activeIndex, setActive, initialActiveIndex, moveActive, toEdge } = useListNavigation({
    enabledIndexes: () => enabledIndexes.value,
    selectedIndex: () => {
      const selected = selectedModel.value
      return selected === null ? -1 : modelList.value.indexOf(selected)
    },
  })

  function openList(edge: ModelSelectorNavigationEdge = 'first'): void {
    if (disabled.value || open.value) return
    setOpen(true)
    setActive(initialActiveIndex(edge))
  }

  function closeList(): void {
    if (!open.value) return
    setOpen(false)
    setActive(-1)
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

  // 开合沿的高亮同步：打开落位（已选优先，否则首个可选）、关闭复位。内部路径
  // （openList/closeList）自行落位后此处空转；受控下外部直接翻转 open（或初始即开）
  // 不经过 openList，由此补齐——否则受控打开无初始高亮/关闭后高亮残留。
  watch(
    open,
    (isOpen) => {
      if (isOpen) {
        if (activeIndex.value < 0) setActive(initialActiveIndex('first'))
      } else {
        setActive(-1)
      }
    },
    { immediate: true },
  )

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
