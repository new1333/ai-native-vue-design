/**
 * useVirtualList —— VirtualList 的 windowing 状态机 composable（headless）。
 *
 * 收口三类语义：
 *   1. 布局：以 getKey 稳定键维护「已测尺寸缓存」，前缀和推出每项主轴起点与总尺寸；
 *      未测量项按 estimatedItemSize 估算——测量是渐进增强，不改变计算路径，
 *      因此 SSR / 无布局环境下同样可推导。
 *   2. 窗口：由 scrollOffset 与 viewportSize 在偏移数组上二分求可视区间，
 *      两侧各扩 overscan；空数据窗口为 { start: 0, end: -1 }。
 *   3. 派生：windowItems（窗口项 + 主轴位置/尺寸），供 SFC 直接 v-for 渲染。
 *
 * SSR 安全：纯计算，不访问任何浏览器 API；scrollOffset / viewportSize /
 * measuredSizes 由组件在 mounted 之后的客户端事件与测量中写入。
 */
import { computed, ref, toValue, unref, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { VIRTUAL_LIST_MIN_ITEM_SIZE } from './VirtualList.constants'
import type { VirtualListKey, VirtualListRange, VirtualWindowItem } from './VirtualList.types'

/** useVirtualList 选项。 */
export interface UseVirtualListOptions<T> {
  /** 全量数据（响应式来源；只读消费，不改写传入数组）。 */
  items: MaybeRefOrGetter<readonly T[]>
  /**
   * 稳定键。注意：键本身是函数值，不能用 toValue 解析（会被当作 getter 误调用），
   * 这里以 unref 只解 Ref；组件传 computed(() => props.getKey) 保持响应式。
   */
  getKey: VirtualListKey<T> | Ref<VirtualListKey<T>>
  /** 单项估算尺寸（响应式来源）。 */
  estimatedItemSize: MaybeRefOrGetter<number>
  /** 视口外每侧预渲染项数（响应式来源）。 */
  overscan: MaybeRefOrGetter<number>
  /** 滚动偏移（主轴 px；由组件的 scroll 监听写入，初始 0）。 */
  scrollOffset: Ref<number>
  /** 视口主轴尺寸（px；由组件在 mounted 后测量写入，初始为假定视口常量）。 */
  viewportSize: Ref<number>
}

/** useVirtualList 返回值。 */
export interface UseVirtualListReturn<T> {
  /** 已测尺寸缓存（稳定键 → 主轴 px；由组件在客户端测量后写入；items 变化后过期键自动清理）。 */
  measuredSizes: Ref<Map<string | number, number>>
  /** 每项主轴起点的前缀和（length = items.length + 1，末位即总尺寸）。 */
  offsets: ComputedRef<number[]>
  /** 内容总尺寸（主轴 px），撑起滚动条。 */
  totalSize: ComputedRef<number>
  /** 可视渲染窗口（含 overscan；空数据 end = -1）。 */
  range: ComputedRef<VirtualListRange>
  /** 窗口项（含主轴位置与尺寸），供渲染层直接 v-for。 */
  windowItems: ComputedRef<VirtualWindowItem<T>[]>
}

/**
 * 窗口起点二分：最后一个 offsets[i] <= position 的项下标
 * （第 i 项覆盖 [offsets[i], offsets[i+1])，即包含 position 的项）。
 */
function findStartIndex(offsets: readonly number[], count: number, position: number): number {
  let low = 0
  let high = count - 1
  let found = 0
  while (low <= high) {
    const mid = (low + high) >> 1
    if (offsets[mid] <= position) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return found
}

/**
 * 窗口终点二分：最后一个 offsets[i] < position 的项下标
 * （第 i 项区间与 [0, position) 相交，position 即视口底边）。
 */
function findEndIndex(offsets: readonly number[], count: number, position: number): number {
  let low = 0
  let high = count - 1
  let found = count - 1
  while (low <= high) {
    const mid = (low + high) >> 1
    if (offsets[mid] < position) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return found
}

/** windowing 状态机 composable。 */
export function useVirtualList<T>(options: UseVirtualListOptions<T>): UseVirtualListReturn<T> {
  const measuredSizes = ref(new Map<string | number, number>())

  // items 变化后清理不存在键：尺寸缓存只增不删会让超长会话（换页/收缩/重建数据）
  // 的过期键无上界增长；键被复用为新项时测量值仍按既有归属保留。
  watch(
    () => toValue(options.items),
    (items) => {
      if (measuredSizes.value.size === 0) return
      const getKey = unref(options.getKey)
      const live = new Set<string | number>()
      for (let i = 0; i < items.length; i++) live.add(getKey(items[i] as T, i))
      for (const key of [...measuredSizes.value.keys()]) {
        if (!live.has(key)) measuredSizes.value.delete(key)
      }
    },
  )

  // 估算尺寸兜底：<= 0 / 非有限数按 1 处理，避免前缀和退化（窗口计算不崩溃）。
  const estimate = computed(() => {
    const value = toValue(options.estimatedItemSize)
    return Number.isFinite(value) && value > 0 ? value : VIRTUAL_LIST_MIN_ITEM_SIZE
  })

  // 每项主轴尺寸：已测量优先（键一致即同一项），未测量按估算。
  const sizes = computed<number[]>(() => {
    const items = toValue(options.items)
    const getKey = unref(options.getKey)
    const cache = measuredSizes.value
    const fallback = estimate.value
    const result = new Array<number>(items.length)
    for (let i = 0; i < items.length; i++) {
      const measured = cache.get(getKey(items[i] as T, i))
      result[i] = typeof measured === 'number' ? measured : fallback
    }
    return result
  })

  const offsets = computed<number[]>(() => {
    const itemSizes = sizes.value
    const result = new Array<number>(itemSizes.length + 1)
    result[0] = 0
    for (let i = 0; i < itemSizes.length; i++) {
      result[i + 1] = result[i] + itemSizes[i]
    }
    return result
  })

  const totalSize = computed(() => {
    const all = offsets.value
    return all[all.length - 1] ?? 0
  })

  const range = computed<VirtualListRange>(() => {
    const count = toValue(options.items).length
    if (count === 0) return { start: 0, end: -1 }
    const all = offsets.value
    const overscan = Math.max(Math.floor(toValue(options.overscan)) || 0, 0)
    const viewport = Math.max(options.viewportSize.value, 0)
    const offset = options.scrollOffset.value
    const start = Math.max(0, findStartIndex(all, count, offset) - overscan)
    const end = Math.min(count - 1, findEndIndex(all, count, offset + viewport) + overscan)
    return { start, end }
  })

  const windowItems = computed<VirtualWindowItem<T>[]>(() => {
    const items = toValue(options.items)
    const getKey = unref(options.getKey)
    const all = offsets.value
    const { start, end } = range.value
    if (end < start) return []
    const result: VirtualWindowItem<T>[] = []
    for (let i = start; i <= end; i++) {
      const item = items[i] as T
      result.push({
        item,
        index: i,
        key: getKey(item, i),
        start: all[i],
        size: all[i + 1] - all[i],
      })
    }
    return result
  })

  return { measuredSizes, offsets, totalSize, range, windowItems }
}
