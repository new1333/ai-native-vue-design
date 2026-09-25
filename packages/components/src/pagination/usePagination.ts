/**
 * usePagination —— Pagination 的窗口计算 composable（headless、SSR 安全）。
 *
 * 收口两件事，保持 SFC 薄：
 *   1. 纯函数 resolvePaginationItems / resolvePageCount / clampPage：
 *      从 total / pageSize / siblingCount / page 推导总页数与渲染项序列
 *      （≤ 全显阈值全部展开；否则 首页 + 滑动窗口 + 尾页，被折叠的连续页码以省略号占位）；
 *   2. usePagination：把响应式 props 变成 pageCount / safePage / items / 边界态，
 *      并提供目标页网关 resolveTarget（越界收敛、当前页去重）。
 *
 * 不访问任何浏览器 API；可在 SSR 与单元测试中独立调用纯函数。
 */
import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import {
  PAGINATION_PAGE_DEFAULT,
  PAGINATION_PAGE_SIZE_DEFAULT,
  PAGINATION_SIBLING_COUNT_DEFAULT,
  PAGINATION_TOTAL_DEFAULT,
} from './Pagination.constants'
import type { PaginationItem, PaginationProps } from './Pagination.types'

/** resolvePaginationItems 选项（纯函数入参，非响应式）。 */
export interface ResolvePaginationItemsOptions {
  /** 数据总条数。 */
  total: number
  /** 每页条数（≤0 按 1 处理，避免除零）。 */
  pageSize: number
  /** 当前页两侧保留的页码数（<0 按 0 处理）。 */
  siblingCount: number
  /** 当前页（窗口以收敛进 [1, pageCount] 后的页为中心）。 */
  page: number
}

/** 由总条数与每页条数推导总页数（至少 1 页）。 */
export function resolvePageCount(total: number, pageSize: number): number {
  const safePageSize = Math.max(1, pageSize)
  const safeTotal = Math.max(0, total)
  return Math.max(1, Math.ceil(safeTotal / safePageSize))
}

/** 把任意页值收敛进 [1, pageCount]。 */
export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(page, 1), pageCount)
}

/**
 * 计算分页渲染项序列（页码 + 省略号占位）。
 *
 * 规则：
 *   - 总页数 ≤ siblingCount*2+5（默认 1 → 7）时全量展开，不出现省略号；
 *   - 否则渲染 首页 + 滑动窗口（宽度恒为 siblingCount*2+1）+ 尾页；
 *     窗口贴边（左缘为 1 / 右缘为 pageCount）时不再重复渲染首页/尾页项；
 *   - 首页与窗口左缘、窗口右缘与尾页之间仍有被折叠页码时，各渲染一个省略号
 *     （非聚焦元素，仅占位）。
 */
export function resolvePaginationItems(options: ResolvePaginationItemsOptions): PaginationItem[] {
  const pageCount = resolvePageCount(options.total, options.pageSize)
  const siblingCount = Math.max(0, options.siblingCount)
  const windowSize = siblingCount * 2 + 1
  // 全显阈值：窗口 + 首页 + 尾页 + 两个省略号位。
  const fullThreshold = windowSize + 4

  if (pageCount <= fullThreshold) {
    return Array.from({ length: pageCount }, (_, index): PaginationItem => ({
      type: 'page',
      page: index + 1,
    }))
  }

  const page = clampPage(options.page, pageCount)
  // 窗口右缘不得越过尾页：左缘上限为 pageCount - windowSize + 1。
  const left = clampPage(page - siblingCount, pageCount - windowSize + 1)
  const right = left + windowSize - 1
  const showLeftGap = left > 2 // 首页与窗口左缘之间仍有被折叠的页码。
  const showRightGap = right < pageCount - 1 // 窗口右缘与尾页之间仍有被折叠的页码。

  const items: PaginationItem[] = []
  if (left > 1) {
    items.push({ type: 'page', page: 1 })
    if (showLeftGap) items.push({ type: 'ellipsis' })
  }
  for (let current = left; current <= right; current += 1) {
    items.push({ type: 'page', page: current })
  }
  if (right < pageCount) {
    if (showRightGap) items.push({ type: 'ellipsis' })
    items.push({ type: 'page', page: pageCount })
  }
  return items
}

/** usePagination 选项（接受 props 对象的 getter / ref / 普通值）。 */
export type UsePaginationOptions = MaybeRefOrGetter<PaginationProps>

/** usePagination 返回值。 */
export interface UsePaginationReturn {
  /** 总页数（≥1）。 */
  pageCount: ComputedRef<number>
  /** 收敛进 [1, pageCount] 后的当前页（aria-current 与窗口中心以此为准）。 */
  safePage: ComputedRef<number>
  /** 渲染项序列（页码 + 省略号占位）。 */
  items: ComputedRef<PaginationItem[]>
  /** 可否上一页（safePage > 1）。 */
  canPrev: ComputedRef<boolean>
  /** 可否下一页（safePage < pageCount）。 */
  canNext: ComputedRef<boolean>
  /**
   * 目标页网关：目标页收敛进 [1, pageCount] 后与当前页相同则返回 null（不动作），
   * 否则返回目标页。页码 / 上一页 / 下一页共用同一条发出路径。
   */
  resolveTarget: (target: number) => number | null
}

/** Pagination 窗口计算 composable。 */
export function usePagination(source: UsePaginationOptions): UsePaginationReturn {
  const pageCount = computed(() => {
    const props = toValue(source)
    return resolvePageCount(
      props.total ?? PAGINATION_TOTAL_DEFAULT,
      props.pageSize ?? PAGINATION_PAGE_SIZE_DEFAULT,
    )
  })
  const safePage = computed(() => {
    const props = toValue(source)
    return clampPage(props.page ?? PAGINATION_PAGE_DEFAULT, pageCount.value)
  })
  const items = computed(() => {
    const props = toValue(source)
    return resolvePaginationItems({
      total: props.total ?? PAGINATION_TOTAL_DEFAULT,
      pageSize: props.pageSize ?? PAGINATION_PAGE_SIZE_DEFAULT,
      siblingCount: props.siblingCount ?? PAGINATION_SIBLING_COUNT_DEFAULT,
      page: safePage.value,
    })
  })
  const canPrev = computed(() => safePage.value > 1)
  const canNext = computed(() => safePage.value < pageCount.value)

  function resolveTarget(target: number): number | null {
    const bounded = clampPage(target, pageCount.value)
    return bounded === safePage.value ? null : bounded
  }

  return { pageCount, safePage, items, canPrev, canNext, resolveTarget }
}
