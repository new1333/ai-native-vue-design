/**
 * message-list/ —— MessageList 的公共类型（Props / Emits / Slots / Expose）。
 * 与 MessageList.meta.ts 的 api 字段保持一致。
 */
import type { ComponentPublicInstance, VNode } from 'vue'

/** 消息稳定键：按条计算（返回 string | number）；v-for DOM 复用的依据。 */
export type MessageListKey<T> = (message: T, index: number) => string | number

/** MessageList 的 Props。 */
export interface MessageListProps<T> {
  /**
   * 消息数据（数据模式）：提供时逐条渲染进 role="log"，每条经 default 插槽（scope:
   * { message, index }）渲染。未提供（undefined）时切换为分发模式：默认插槽内容
   * 原样渲染进滚动容器，组件不接管逐条结构。注意：显式传空数组 [] 即数据模式的空态。
   */
  messages?: T[]
  /**
   * 贴底自动滚动：仅当视口处于贴底阈值内（nearBottomThreshold）时，内容更新后
   * 自动定位到底部；挂载首帧同样贴底定位。用户向上翻阅离开贴底区后不再打扰，
   * 可用 expose 的 scrollToBottom 随时回到最新消息。默认 true。
   */
  autoScroll?: boolean
  /**
   * 贴底判定阈值（px）：视口底边距内容底部 ≤ 该值视为贴底。默认
   * MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT（48）。
   */
  nearBottomThreshold?: number
  /**
   * 消息稳定键（数据模式）：字段唯一时建议提供（如 (m) => m.id）；缺省回落渲染下标。
   * loadMore 前插历史消息时，下标键会导致整列表重建 DOM，请尽量提供稳定键。
   */
  messageKey?: MessageListKey<T>
}

/** MessageList 的 Emits（Vue 3.3+ 元组语法）。 */
export interface MessageListEmits {
  /** 原生滚动透传：滚动容器发出 scroll 时原样转发（不劫持、不 preventDefault）。 */
  scroll: [event: Event]
  /**
   * 贴底状态播报：挂载首帧播报一次初始值；此后仅在进入/离开贴底区（状态翻转）时发出。
   * 载荷为当前是否贴底（true = 贴底）。
   */
  nearBottom: [value: boolean]
  /**
   * 滚动接近顶部：进入顶部触发区（scrollTop ≤ MESSAGE_LIST_LOAD_MORE_THRESHOLD）时
   * 发出一次，用于加载更早的历史消息；离开该区域后再次进入才会再次发出。
   * 加载中的指示与去重由使用方处理。
   */
  loadMore: []
}

/** default 插槽作用域（数据模式下逐条传入）。 */
export interface MessageListMessageScope<T> {
  /** 当前消息数据。 */
  message: T
  /** 当前消息下标（按渲染顺序）。 */
  index: number
}

/**
 * MessageList 的 Slots。
 * default：数据模式下为逐条消息插槽（scope: { message, index }），分发模式下为
 * 原样分发的内容区（作用域不消费）；empty：空态内容，缺省渲染 EmptyState。
 */
export interface MessageListSlots<T> {
  /** 逐条消息内容（数据模式）或直接分发的内容（分发模式）。 */
  default?: (scope: MessageListMessageScope<T>) => VNode[]
  /** 空态内容；仅在无消息可渲染时出现，缺省渲染 EmptyState（title「暂无消息」）。 */
  empty?: () => VNode[]
}

/** MessageList 对外暴露的实例方法。 */
export interface MessageListExpose {
  /** 立即定位到滚动容器底部（即时赋值 scrollTop，不做平滑动画）；典型用于「回到底部」按钮。 */
  scrollToBottom: () => void
}

/** MessageList 组件实例类型（公共实例形态 + scrollToBottom 暴露）。 */
export type MessageListInstance = ComponentPublicInstance & MessageListExpose
