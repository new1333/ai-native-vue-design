/**
 * select/ —— 逻辑常量收口（默认文案、键盘键名、aria 可读名称）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** 默认占位文案（触发器上无已选值时显示）。 */
export const SELECT_PLACEHOLDER_DEFAULT = '请选择' as const

/** 默认空态文案（options 为空数组时弹层内显示）。 */
export const SELECT_EMPTY_TEXT_DEFAULT = '暂无选项' as const

/** 清空按钮的可读名称：仅图标、无文本，必须有 aria-label。 */
export const SELECT_CLEAR_ARIA_LABEL = '清空' as const

/**
 * 键盘状态机受理的键名全集（WAI-ARIA combobox + listbox 弹出模式）：
 * ↓/↑ 移动高亮、Home/End 首尾、Enter/Space 选中或打开、Esc 关闭。
 */
export const SELECT_NAVIGATION_KEYS: readonly string[] = [
  'ArrowDown',
  'ArrowUp',
  'Home',
  'End',
  'Enter',
  ' ',
  'Escape',
]
