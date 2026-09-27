/**
 * accordion/ —— 逻辑常量收口（键名、默认值；不是视觉值，视觉只走 --ui-* token）。
 */

/** multiple 默认值：默认单开模式。 */
export const ACCORDION_MULTIPLE_DEFAULT = false

/**
 * 展开状态切换键：Enter / Space 激活当前头部（与原生 button 激活键一致）。
 * keydown 阶段统一 preventDefault 后改走 toggle，保证 Space 不滚动页面且单次触发。
 */
export const ACCORDION_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']

/**
 * roving tabindex 焦点导航键（WAI-ARIA Accordion 模式）：
 * ArrowDown/ArrowUp 在头部间循环移动焦点（跳过禁用项），Home/End 直达首/尾可用头部。
 */
export const ACCORDION_NAVIGATION_KEYS: readonly string[] = ['ArrowDown', 'ArrowUp', 'Home', 'End']
