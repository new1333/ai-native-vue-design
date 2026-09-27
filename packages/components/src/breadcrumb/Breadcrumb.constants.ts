/**
 * breadcrumb/ —— 逻辑常量收口（文案、键名、激活键；不是视觉值，视觉只走 --ui-* token）。
 */

/** nav 的默认 aria-label（可被使用方以同名 aria-label attr 覆写）。 */
export const BREADCRUMB_ARIA_LABEL = '面包屑'

/** maxCount 的最小有效值：折叠时至少保留「首项 + 省略号 + 末项」3 个槽位。 */
export const BREADCRUMB_MAX_COUNT_MIN = 3

/**
 * button 项的键盘激活键：原生 button 的 Enter / Space。
 * 统一在 keydown 阶段 preventDefault 后经程序化 click() 单次触发，
 * 保证测试环境（happy-dom/node）与真实浏览器行为一致且不双触发（同 Tabs/useButton 策略）。
 */
export const BREADCRUMB_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']

/** 折叠占位字符（aria-hidden 的非聚焦 span 渲染）。 */
export const BREADCRUMB_ELLIPSIS_CHAR = '…'

/** 省略号条目的 v-for 键。 */
export const BREADCRUMB_ELLIPSIS_KEY = 'ui-breadcrumb-ellipsis'

/** 项缺省 key 的前缀（item.key 未提供时回退 `前缀 + index`）。 */
export const BREADCRUMB_ITEM_KEY_PREFIX = 'ui-breadcrumb-item-'
