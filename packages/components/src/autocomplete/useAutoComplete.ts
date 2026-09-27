/**
 * useAutoComplete —— AutoComplete 的建议/开合/高亮/键盘/防抖状态机 composable（headless）。
 *
 * 收口带建议列表的可输入选择器的全部纯逻辑，不含任何 DOM / 浏览器 API：
 *   1. 建议派生：options 归一化（value 缺省回退 label）→ 按过滤策略得到 suggestions；
 *      过滤策略 undefined = 默认本地包含匹配（不区分大小写）、false = 不过滤（远程模式）、
 *      函数 = 自定义本地过滤；
 *   2. 开合状态（open）与高亮下标（activeIndex，作用于 suggestions 下标）；
 *   3. 打开落位：edge 端首个可选建议（↓/键入路径 first，↑ 路径 last）；
 *   4. 关键词变更路径（键入/清空共用）：打开面板 + 高亮落位 + 调度防抖 search；
 *   5. 选中出口：select(index) → onSelect 回调（组件把 update:modelValue/select 的 emit
 *      挂到这里），并取消未决 search（防选中后的陈旧关键词补发）；
 *   6. 键盘状态机（输入框变体，对齐 Select 键盘路径）：↓/↑ 打开或移动高亮（跳过 disabled、
 *      两端夹住）、Enter 选中高亮项（无高亮则关闭）、Esc 关闭；受理键一律 preventDefault。
 *      Tab/Home/End/Space 不受理——输入框保留文本编辑原义（光标移动、空格、焦点流转）。
 *
 * SSR 安全：不访问任何浏览器 API；KeyboardEvent 仅读取 key 并调用 preventDefault；
 * setTimeout 为跨运行时 API，且只在键入/清空事件路径触达（SSR 不经过）。
 */
import { computed, ref, toValue, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import {
  AUTOCOMPLETE_DEBOUNCE_DEFAULT,
  AUTOCOMPLETE_HANDLED_KEYS,
} from './AutoComplete.constants'
import type {
  AutoCompleteEdge,
  AutoCompleteFilter,
  AutoCompleteOption,
  AutoCompleteSelectedOption,
} from './AutoComplete.types'

/** useAutoComplete 选项。 */
export interface UseAutoCompleteOptions {
  /** 受控文本来源（响应式）：即输入框当前关键词。 */
  modelValue: MaybeRefOrGetter<string>
  /** 建议全集来源（响应式）。 */
  options: MaybeRefOrGetter<AutoCompleteOption[]>
  /** 禁用总闸（响应式）：一切开合/键入/选中路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean>
  /** 过滤策略来源（响应式），见 AutoCompleteFilter。 */
  filter?: MaybeRefOrGetter<AutoCompleteFilter | undefined>
  /** search 防抖毫秒数来源（响应式）；0 = 立即发出。 */
  debounce?: MaybeRefOrGetter<number | undefined>
  /** 文本更新出口（组件把 update:modelValue 的 emit 挂到这里）。 */
  onUpdate: (value: string) => void
  /** 关键词变更（经防抖）出口（组件把 search 的 emit 挂到这里）。 */
  onSearch: (keyword: string) => void
  /** 选中建议出口（组件把 update:modelValue/select 的 emit 挂到这里）。 */
  onSelect: (option: AutoCompleteSelectedOption) => void
}

/** useAutoComplete 返回值。 */
export interface UseAutoCompleteReturn {
  /** 建议面板是否打开。 */
  open: Ref<boolean>
  /** 当前高亮建议下标（作用于 suggestions；-1 = 无高亮，关闭时复位）。 */
  activeIndex: Ref<number>
  /** 归一化 + 过滤后的建议（面板渲染与选中均以此为准）。 */
  suggestions: ComputedRef<AutoCompleteSelectedOption[]>
  /** 打开面板；高亮落位 = edge 端首个可选建议（无可选则 -1）。 */
  openList: (edge?: AutoCompleteEdge) => void
  /** 关闭面板并复位高亮。 */
  closeList: () => void
  /** 高亮移动 step 步：跳过 disabled 建议，在可选集合两端夹住。 */
  moveActive: (step: 1 | -1) => void
  /** 选中指定下标的建议（disabled/越界忽略）：取消未决 search → onSelect → 关闭。 */
  select: (index: number) => void
  /** 键入路径：发出文本更新 + 关键词变更（打开/落位/防抖 search）。 */
  handleInput: (value: string) => void
  /** 关键词变更路径（键入与清空共用）：打开面板 + 高亮落位 + 调度防抖 search。 */
  handleKeywordChange: (keyword: string) => void
  /**
   * 键盘状态机（绑定在输入框 keydown）：
   * 受理键一律 preventDefault（↓/↑ 防光标跳动、Enter 防表单误提交），其余键放行。
   */
  handleKeydown: (event: KeyboardEvent) => void
  /** 取消未决的防抖 search（卸载清理与选中路径使用）。 */
  cancelPendingSearch: () => void
}

/** 归一化：value 缺省回退为 label。 */
function normalizeOption(option: AutoCompleteOption): AutoCompleteSelectedOption {
  return {
    label: option.label,
    value: option.value ?? option.label,
    disabled: option.disabled === true ? true : undefined,
  }
}

/** 默认本地过滤：label 包含关键词原文（不区分大小写，不做 trim）。 */
function defaultFilter(option: AutoCompleteSelectedOption, keyword: string): boolean {
  return option.label.toLowerCase().includes(keyword.toLowerCase())
}

/** AutoComplete 建议/开合/高亮/键盘/防抖状态机（纯逻辑，无 DOM）。 */
export function useAutoComplete(options: UseAutoCompleteOptions): UseAutoCompleteReturn {
  const open = ref(false)
  const activeIndex = ref(-1)

  const disabled = computed(() => toValue(options.disabled) === true)
  const keyword = computed(() => toValue(options.modelValue) ?? '')

  const suggestions = computed<AutoCompleteSelectedOption[]>(() => {
    const list = toValue(options.options) ?? []
    const normalized = list.map(normalizeOption)
    const filter = toValue(options.filter)
    if (filter === false) return normalized
    if (typeof filter === 'function') {
      return normalized.filter((option) => filter(option, keyword.value))
    }
    return normalized.filter((option) => defaultFilter(option, keyword.value))
  })

  /** 可选（非 disabled）建议的下标全集，导航只在其中移动。 */
  const enabledIndexes = computed<number[]>(() =>
    suggestions.value.flatMap((option, index) => (option.disabled ? [] : [index])),
  )

  /** 打开时的高亮落位：edge 端首个可选建议。 */
  function initialActiveIndex(edge: AutoCompleteEdge): number {
    const enabled = enabledIndexes.value
    if (enabled.length === 0) return -1
    return edge === 'first' ? enabled[0] : enabled[enabled.length - 1]
  }

  function openList(edge: AutoCompleteEdge = 'first'): void {
    if (disabled.value) return
    open.value = true
    activeIndex.value = initialActiveIndex(edge)
  }

  function closeList(): void {
    if (!open.value) return
    open.value = false
    activeIndex.value = -1
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

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  function cancelPendingSearch(): void {
    if (searchTimer !== null) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
  }

  function scheduleSearch(value: string): void {
    cancelPendingSearch()
    const delay = toValue(options.debounce) ?? AUTOCOMPLETE_DEBOUNCE_DEFAULT
    if (delay <= 0) {
      options.onSearch(value)
      return
    }
    searchTimer = setTimeout(() => {
      searchTimer = null
      options.onSearch(value)
    }, delay)
  }

  function handleKeywordChange(value: string): void {
    if (disabled.value) return
    openList('first')
    scheduleSearch(value)
  }

  function handleInput(value: string): void {
    if (disabled.value) return
    options.onUpdate(value)
    handleKeywordChange(value)
  }

  function select(index: number): void {
    const option = suggestions.value[index]
    if (option === undefined || option.disabled === true) return
    cancelPendingSearch()
    options.onSelect(option)
    closeList()
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (disabled.value) return
    if (!AUTOCOMPLETE_HANDLED_KEYS.includes(event.key)) return
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (open.value) moveActive(1)
        else openList('first')
        break
      case 'ArrowUp':
        event.preventDefault()
        if (open.value) moveActive(-1)
        else openList('last')
        break
      case 'Enter':
        if (open.value) {
          event.preventDefault()
          if (activeIndex.value >= 0) select(activeIndex.value)
          else closeList()
        }
        break
      case 'Escape':
        if (open.value) {
          event.preventDefault()
          closeList()
        }
        break
      default:
        break
    }
  }

  // 异步建议替换后：高亮越界或指向变为 disabled 的建议 → 钳回首个可选建议
  // （无可选则 -1）；键入路径的落位在 openList 内完成，此处是远程结果到达时的安全网。
  watch(suggestions, (list) => {
    if (!open.value) return
    const current = activeIndex.value
    const invalid =
      current >= list.length || (current >= 0 && list[current]?.disabled === true)
    if (invalid) {
      activeIndex.value = list.findIndex((option) => option.disabled !== true)
    }
  })

  return {
    open,
    activeIndex,
    suggestions,
    openList,
    closeList,
    moveActive,
    select,
    handleInput,
    handleKeywordChange,
    handleKeydown,
    cancelPendingSearch,
  }
}
