/**
 * useBreadcrumb —— Breadcrumb 的展示模型 composable（headless、纯 computed）。
 *
 * 收口折叠语义：items 超出 maxCount 时渲染为「首项 + 省略号 + 末尾 (maxCount - 2) 项」，
 * 可见槽位数恰为收敛后的 maxCount（含省略号占位），末项（当前页）永远保留。
 *
 * SSR 安全：纯函数计算，不访问任何浏览器 API。
 */
import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { BREADCRUMB_ITEM_KEY_PREFIX, BREADCRUMB_MAX_COUNT_MIN } from './Breadcrumb.constants'
import type { BreadcrumbItem } from './Breadcrumb.types'

/** 展示条目：真实项（携带源下标与当前页标记）或省略号占位。 */
export type BreadcrumbDisplayEntry =
  | { type: 'item'; item: BreadcrumbItem; index: number; isCurrent: boolean }
  | { type: 'ellipsis' }

/** useBreadcrumb 选项。 */
export interface UseBreadcrumbOptions {
  /** 数据源（响应式 getter）。 */
  items: MaybeRefOrGetter<BreadcrumbItem[]>
  /** 最大可见槽位数（响应式 getter；undefined 表示不折叠）。 */
  maxCount: MaybeRefOrGetter<number | undefined>
}

/** useBreadcrumb 返回的展示模型。 */
export interface BreadcrumbController {
  /** 渲染用展示条目（含折叠）。 */
  displayEntries: ComputedRef<BreadcrumbDisplayEntry[]>
  /** 项的 v-for 键：item.key 优先，回退「前缀 + index」。 */
  itemKeyFor: (index: number, item: BreadcrumbItem) => string
}

/** 全量展示（不折叠）。 */
function toAllEntries(items: BreadcrumbItem[]): BreadcrumbDisplayEntry[] {
  return items.map((item, index) => ({
    type: 'item',
    item,
    index,
    isCurrent: index === items.length - 1,
  }))
}

/** 折叠展示：首项 + 省略号 + 末尾 (visibleTailCount) 项。 */
function toFoldedEntries(items: BreadcrumbItem[], visibleTailCount: number): BreadcrumbDisplayEntry[] {
  const entries: BreadcrumbDisplayEntry[] = [
    { type: 'item', item: items[0]!, index: 0, isCurrent: items.length === 1 },
    { type: 'ellipsis' },
  ]
  const tailStart = Math.max(1, items.length - visibleTailCount)
  for (let index = tailStart; index < items.length; index++) {
    entries.push({
      type: 'item',
      item: items[index]!,
      index,
      isCurrent: index === items.length - 1,
    })
  }
  return entries
}

/** Breadcrumb 展示模型。 */
export function useBreadcrumb(options: UseBreadcrumbOptions): BreadcrumbController {
  const displayEntries = computed<BreadcrumbDisplayEntry[]>(() => {
    const items = toValue(options.items)
    const maxCount = toValue(options.maxCount)

    if (items.length === 0) return []
    if (maxCount === undefined || !Number.isFinite(maxCount)) return toAllEntries(items)

    // 小于 3 收敛为 3（至少保留首项 + 省略号 + 末项），非整数向下取整。
    const resolvedMaxCount = Math.max(BREADCRUMB_MAX_COUNT_MIN, Math.floor(maxCount))
    if (items.length <= resolvedMaxCount) return toAllEntries(items)

    return toFoldedEntries(items, resolvedMaxCount - 2)
  })

  function itemKeyFor(index: number, item: BreadcrumbItem): string {
    return item.key ?? `${BREADCRUMB_ITEM_KEY_PREFIX}${index}`
  }

  return { displayEntries, itemKeyFor }
}
