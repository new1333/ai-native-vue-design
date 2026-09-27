/**
 * virtual-list/ —— VirtualList 的公共类型（Props / Emits / Slots / 载荷）。
 * 与 VirtualList.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 可见渲染窗口（含 overscan 的首尾下标，闭区间）；items 为空时 end = -1。 */
export interface VirtualListRange {
  /** 窗口首个下标（含 overscan，已收敛到 [0, items.length - 1]）。 */
  start: number
  /** 窗口末个下标（含 overscan，闭区间）；空数据时为 -1。 */
  end: number
}

/** visibleRangeChange 事件载荷。 */
export type VirtualListRangeChangePayload = VirtualListRange

/**
 * scroll 事件载荷：原生 scroll 事件原样透传。
 * 组件不劫持原生滚动（不 preventDefault、不代写 scrollLeft/scrollTop）。
 */
export type VirtualListScrollPayload = Event

/**
 * 稳定键：按项计算（返回 string | number）。
 * 同时承担 v-for 的 DOM 复用与「已测尺寸缓存」的归属键——键一致的项被视为同一项，
 * 换数据源时请保持键唯一稳定，否则旧测量值会按键套用到新项。
 */
export type VirtualListKey<T> = (item: T, index: number) => string | number

/** VirtualList 的 Props。 */
export interface VirtualListProps<T> {
  /** 全量数据源；组件只渲染可视窗口项，不改写传入数组。 */
  items: T[]
  /**
   * 单项估算尺寸（主轴 px，须为正数，<= 0 按 1 处理）：
   * 未测量项的尺寸与 SSR / 无布局环境下首屏窗口的推导基准。
   */
  estimatedItemSize: number
  /** 视口外每侧预渲染项数；默认 5。 */
  overscan?: number
  /** 水平模式：主轴切换为横向（scrollLeft / 宽度驱动窗口）；默认 false（纵向）。 */
  horizontal?: boolean
  /** 稳定键（必填）：DOM 复用与尺寸缓存的依据。 */
  getKey: VirtualListKey<T>
}

/** VirtualList 的 Emits（Vue 3.3+ 元组语法）。 */
export interface VirtualListEmits {
  /** 原生滚动透传：滚动容器发出 scroll 时原样转发（不劫持、不 preventDefault）。 */
  scroll: [event: VirtualListScrollPayload]
  /** 渲染窗口变化：挂载首帧及 start/end 任一变化时发出（含 overscan；空数据 end = -1）。 */
  visibleRangeChange: [payload: VirtualListRangeChangePayload]
}

/** `item` 插槽作用域。 */
export interface VirtualListItemScope<T> {
  /** 当前项数据。 */
  item: T
  /** 当前项在 items 中的全局下标。 */
  index: number
}

/**
 * VirtualList 的 Slots。
 * item 为窗口内逐项插槽；empty 在 items 为空时替换默认空态文案。
 */
export interface VirtualListSlots<T> {
  /** 单项内容：作用域 { item, index }；缺省对 string/number 项渲染其文本，其余渲染为空。 */
  item?: (scope: VirtualListItemScope<T>) => VNode[]
  /** 空态内容；缺省渲染「暂无数据」。 */
  empty?: () => VNode[]
}

/** 渲染窗口内的单项描述（useVirtualList 返回值元素，含主轴位置与尺寸）。 */
export interface VirtualWindowItem<T> {
  /** 项数据。 */
  item: T
  /** 全局下标。 */
  index: number
  /** 稳定键（getKey 求值结果）。 */
  key: string | number
  /** 项主轴起点 px（此前所有项已测/估算尺寸的前缀和）。 */
  start: number
  /** 项主轴尺寸 px（已测值或估算值）。 */
  size: number
}
