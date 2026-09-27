/**
 * timeline/ —— Timeline 的公共类型（Props / Slots）。
 * 与 Timeline.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 布局档位：'left' 单侧（连线靠左、内容居右）；'alternate' 中轴两侧交替。 */
export type TimelineMode = 'left' | 'alternate'

/** 事件项。 */
export interface TimelineItem {
  /** 稳定 v-for 键；缺省回落渲染下标。 */
  key?: string | number
  /** 主文案（text-1 / medium）。 */
  title: string
  /** 次要说明（text-2，弱化）。 */
  description?: string
  /** 时间标注（text-3 + tabular-nums）。 */
  time?: string
}

/** Timeline 的 Props。 */
export interface TimelineProps {
  /** 事件项列表：按数组顺序自上而下渲染为节点 + 连线。 */
  items: TimelineItem[]
  /** 布局档位，默认 'left'。 */
  mode?: TimelineMode
  /**
   * 进行中（幽灵）节点：在列表末尾追加一个脉冲点节点并显示默认文案
   * （TIMELINE_PENDING_TEXT，见 Timeline.constants），表示事件流仍在推进、后续还有内容。
   */
  pending?: boolean
}

/** item 插槽作用域。 */
export interface TimelineItemScope {
  /** 当前事件项。 */
  item: TimelineItem
  /** 渲染下标（按渲染顺序，含 pending 之外的普通项）。 */
  index: number
}

/** dot 插槽作用域。 */
export interface TimelineDotScope {
  /** 当前事件项；pending（幽灵）节点上为 undefined。 */
  item?: TimelineItem
  /** 渲染下标；pending 节点取 items.length。 */
  index: number
  /** 是否为 pending（幽灵）节点。 */
  pending: boolean
}

/**
 * Timeline 的 Slots（全部可选）。
 * 内容由 props 驱动；item / dot 插槽按需覆盖默认渲染，footer 承载列表之下的附加区。
 */
export interface TimelineSlots {
  /** 整项内容：覆盖 title/description/time 的默认渲染。 */
  item?: (scope: TimelineItemScope) => VNode[]
  /** 节点圆点：覆盖默认圆点（普通项与 pending 节点都会经过此插槽）。 */
  dot?: (scope: TimelineDotScope) => VNode[]
  /** 时间线末尾附加区（如「加载更多」「查看全部」），渲染于列表之下。 */
  footer?: () => VNode[]
}
