/**
 * autocomplete/ —— 逻辑常量收口（默认文案、键盘键名、aria 可读名称、防抖默认值）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** 默认占位文案（输入框为空时显示）。 */
export const AUTOCOMPLETE_PLACEHOLDER_DEFAULT = '请输入' as const

/** 默认空态文案（建议为空且非加载时面板内显示）。 */
export const AUTOCOMPLETE_EMPTY_TEXT_DEFAULT = '暂无匹配' as const

/** 默认加载文案（loading 且建议为空时面板内显示）。 */
export const AUTOCOMPLETE_LOADING_TEXT_DEFAULT = '加载中…' as const

/** 清空按钮的可读名称：仅图标、无文本，必须有 aria-label。 */
export const AUTOCOMPLETE_CLEAR_ARIA_LABEL = '清空' as const

/** search 事件防抖默认毫秒数（合并连续击键，远程搜索友好）。 */
export const AUTOCOMPLETE_DEBOUNCE_DEFAULT = 200

/**
 * 键盘状态机受理的键名全集（WAI-ARIA combobox + listbox，输入框变体）：
 * ↓/↑ 打开或移动高亮、Enter 选中或关闭、Esc 关闭。
 * 注意：Tab/Home/End/Space 均不在其中——输入框需保留文本编辑原义
 * （光标移动、空格输入、焦点流转），不劫持。
 */
export const AUTOCOMPLETE_HANDLED_KEYS: readonly string[] = [
  'ArrowDown',
  'ArrowUp',
  'Enter',
  'Escape',
]
