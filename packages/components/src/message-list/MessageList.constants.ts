/**
 * message-list/ —— 逻辑常量收口（贴底阈值、loadMore 触发距离、空态文案；
 * 不是视觉值，视觉只走 --ui-* token）。
 */

/**
 * 贴底阈值默认值（px）：视口底边距内容底部的距离（scrollHeight - scrollTop - clientHeight）
 * ≤ 该值时判定为「贴底」，autoScroll 才会跟随新消息滚动。
 * 逻辑常量（滚动判定基准），非视觉值；可用同名 prop nearBottomThreshold 覆盖。
 */
export const MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT = 48

/**
 * loadMore 顶部触发距离（px）：scrollTop ≤ 该值视为进入「加载更早消息」区域。
 * 逻辑常量（滚动判定基准），非视觉值；边沿触发语义见 useMessageListScroll。
 */
export const MESSAGE_LIST_LOAD_MORE_THRESHOLD = 32

/** 空态默认标题（empty 插槽缺省时传给 EmptyState 的 title；文案常量非视觉值）。 */
export const MESSAGE_LIST_EMPTY_TITLE = '暂无消息'
