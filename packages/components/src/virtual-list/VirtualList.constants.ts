/**
 * virtual-list/ —— 逻辑常量收口（windowing 默认值、无布局环境的假定视口、空态文案；
 * 不是视觉值，视觉只走 --ui-* token）。
 */

/** overscan 缺省值：窗口两侧各多渲染 5 项，为双向滚动预留缓冲。 */
export const VIRTUAL_LIST_OVERSCAN_DEFAULT = 5

/**
 * 无布局信息环境（SSR / 无布局引擎的测试环境）的假定视口主轴尺寸（px）。
 * 用于推导「首屏窗口」：挂载前或实测视口为 0 时按此值计算渲染区间，
 * 使 SSR 直出有意义的首屏。逻辑常量（windowing 推导基准），非视觉值；
 * 真实浏览器中挂载后即被 clientWidth/Height 实测值覆盖。
 */
export const VIRTUAL_LIST_VIEWPORT_FALLBACK = 600

/** estimatedItemSize 非法输入（<= 0 / 非有限数）的兜底值，避免前缀和退化。 */
export const VIRTUAL_LIST_MIN_ITEM_SIZE = 1

/** 空态默认文案（empty 插槽缺省值；文案常量非视觉值）。 */
export const VIRTUAL_LIST_EMPTY_TEXT_DEFAULT = '暂无数据'
