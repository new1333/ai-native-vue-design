/**
 * accordion/ —— Accordion 的状态机与键盘逻辑收口：
 * 展开 keys 集合的归一化（单开/多开）、受控/非受控双模式、
 * roving tabindex 与 WAI-ARIA Accordion 键盘导航（Enter/Space、↑/↓ 循环跳过禁用、Home/End）。
 * DOM 触碰（focus）只发生在客户端事件回调内；setup 顶层不访问浏览器 API。
 */
import { computed, ref } from 'vue'
import { ACCORDION_ACTIVATION_KEYS, ACCORDION_NAVIGATION_KEYS } from './Accordion.constants'
import type {
  AccordionChangeEvent,
  AccordionItem,
  AccordionItemKey,
  AccordionModelValue,
} from './Accordion.types'

/** useAccordion 的入参：getter 保持响应式，emit 由组件传入。 */
export interface UseAccordionOptions {
  /** 条目数据源 getter。 */
  items: () => AccordionItem[]
  /** 是否多开模式 getter。 */
  multiple: () => boolean
  /** modelValue getter；undefined 表示非受控（组件内部持有状态）。 */
  modelValue: () => AccordionModelValue | undefined
  /** 非受控初始展开值 getter（仅初始化时读取一次；受控模式下忽略）。 */
  defaultValue: () => AccordionModelValue | undefined
  /** 组件 emit（update:modelValue / change）。 */
  emit: {
    (event: 'update:modelValue', value: AccordionModelValue): void
    (event: 'change', payload: AccordionChangeEvent): void
  }
}

/** 把任意形态的 modelValue 归一化为「展开 keys 集合」：单开取第一个 key，多开取数组全集；未知形态一律视为空。 */
function normalizeToKeys(
  value: AccordionModelValue | undefined | null,
  multiple: boolean,
): Set<AccordionItemKey> {
  if (value === undefined || value === null) return new Set()
  if (multiple) {
    return new Set(Array.isArray(value) ? value : [value])
  }
  const key = Array.isArray(value) ? value[0] : value
  return key === undefined || key === null ? new Set() : new Set([key])
}

/**
 * Accordion 状态机。
 * - 受控：modelValue 提供 → 展开状态完全由 prop 派生，切换只 emit；
 * - 非受控：内部持有上次提交值（初始值取 defaultValue，缺省全部收起），切换时更新内部值并 emit。
 * 多开模式的展开值按 items 顺序规范化输出（modelValue 中不属于 items 的 key 不参与渲染，切换时被规范化移除）。
 */
export function useAccordion(options: UseAccordionOptions) {
  const { emit } = options

  /** 非受控模式的内部展开值（形态随 multiple：单开 key|null，多开 keys 数组；初始取 defaultValue，缺省全部收起）。 */
  const internalValue = ref<AccordionModelValue | null>(options.defaultValue() ?? null)

  /** 受控判定：modelValue prop 是否被提供。 */
  const isControlled = computed(() => options.modelValue() !== undefined)

  /** 当前展开 keys 集合（受控由 prop 派生，非受控由内部值派生）。 */
  const openKeys = computed<ReadonlySet<AccordionItemKey>>(() =>
    normalizeToKeys(
      isControlled.value ? options.modelValue() : internalValue.value,
      options.multiple(),
    ),
  )

  /** 条目是否展开。 */
  function isOpen(key: AccordionItemKey): boolean {
    return openKeys.value.has(key)
  }

  /**
   * 提交一次切换：计算下一个展开值（多开按 items 顺序规范化），
   * 非受控时先落地内部值，随后 emit update:modelValue 与 change。
   */
  function commit(item: AccordionItem, nextKeys: ReadonlySet<AccordionItemKey>): void {
    const multiple = options.multiple()
    const items = options.items()
    const value: AccordionModelValue = multiple
      ? items.filter((entry) => nextKeys.has(entry.key)).map((entry) => entry.key)
      : nextKeys.size > 0
        ? item.key
        : null

    if (!isControlled.value) internalValue.value = value
    emit('update:modelValue', value)
    emit('change', { key: item.key, expanded: nextKeys.has(item.key), value })
  }

  /** 切换指定下标条目的展开状态；禁用条目直接忽略。 */
  function toggleAt(index: number): void {
    const item = options.items()[index]
    if (!item || item.disabled) return

    const nextKeys = new Set(openKeys.value)
    if (nextKeys.has(item.key)) {
      nextKeys.delete(item.key)
    } else if (options.multiple()) {
      nextKeys.add(item.key)
    } else {
      nextKeys.clear()
      nextKeys.add(item.key)
    }
    commit(item, nextKeys)
  }

  // ── roving tabindex：同一时刻恰有一个头部可 Tab（默认首个可用条目）────
  const focusIndex = ref<number | null>(null)

  const firstEnabledIndex = computed(() => options.items().findIndex((item) => !item.disabled))

  /** 当前 Tab 停靠点：焦点所在可用头部，否则首个可用条目；全部禁用时为 -1（无停靠点）。 */
  const tabStopIndex = computed(() => {
    const focused = focusIndex.value
    if (focused !== null) {
      const item = options.items()[focused]
      if (item && !item.disabled) return focused
    }
    return firstEnabledIndex.value
  })

  /** 头部获得焦点：停靠点跟随焦点。 */
  function onTriggerFocus(index: number): void {
    focusIndex.value = index
  }

  // ── 头部元素登记：供键盘导航聚焦（仅客户端事件回调内触碰 DOM）────────
  const triggerEls: Array<HTMLButtonElement | null> = []

  function setTriggerRef(index: number, el: unknown): void {
    triggerEls[index] = (el as HTMLButtonElement | null) ?? null
  }

  /** 从 from 出发按方向找下一个可用条目下标（循环；全禁用时原地不动）。 */
  function nextEnabledIndex(from: number, direction: 1 | -1): number {
    const items = options.items()
    const count = items.length
    let cursor = from
    for (let step = 0; step < count; step += 1) {
      cursor = (cursor + direction + count) % count
      if (!items[cursor]?.disabled) return cursor
    }
    return from
  }

  /** 头部键盘导航：在可用头部间移动焦点（循环、跳过禁用；Home/End 直达首尾）。 */
  function focusAt(index: number): void {
    const target = triggerEls[index]
    focusIndex.value = index
    target?.focus()
  }

  /** 头部 keydown 统一入口：激活键切换展开，导航键移动焦点；两者均 preventDefault。 */
  function onTriggerKeydown(event: KeyboardEvent, index: number): void {
    if (ACCORDION_ACTIVATION_KEYS.includes(event.key)) {
      event.preventDefault()
      toggleAt(index)
      return
    }
    if (!ACCORDION_NAVIGATION_KEYS.includes(event.key)) return

    event.preventDefault()
    const first = firstEnabledIndex.value
    if (first < 0) return

    switch (event.key) {
      case 'ArrowDown':
        focusAt(nextEnabledIndex(index, 1))
        break
      case 'ArrowUp':
        focusAt(nextEnabledIndex(index, -1))
        break
      case 'Home':
        focusAt(first)
        break
      case 'End':
        focusAt(lastEnabledIndex.value)
        break
      default:
        break
    }
  }

  const lastEnabledIndex = computed(() => {
    const items = options.items()
    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (!items[index]?.disabled) return index
    }
    return -1
  })

  return {
    isOpen,
    toggleAt,
    onTriggerKeydown,
    onTriggerFocus,
    tabStopIndex,
    setTriggerRef,
  }
}
