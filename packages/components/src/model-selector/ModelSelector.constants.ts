/**
 * model-selector/ —— 逻辑常量收口（默认文案、键盘键名）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** 默认占位文案（触发器上无已选模型时显示）。 */
export const MODEL_SELECTOR_PLACEHOLDER_DEFAULT = '选择模型' as const

/** 默认空态文案（models 为空数组且非加载中时弹层内显示）。 */
export const MODEL_SELECTOR_EMPTY_TEXT_DEFAULT = '暂无可用模型' as const

/** 默认加载中文案（loading 期间打开弹层显示）。 */
export const MODEL_SELECTOR_LOADING_TEXT_DEFAULT = '模型列表加载中…' as const

/**
 * 键盘状态机受理的键名全集（WAI-ARIA combobox + listbox 弹出模式，与 Select 同纪律）：
 * ↓/↑ 移动高亮、Home/End 首尾、Enter/Space 选中或打开、Esc 关闭。
 */
export const MODEL_SELECTOR_NAVIGATION_KEYS: readonly string[] = [
  'ArrowDown',
  'ArrowUp',
  'Home',
  'End',
  'Enter',
  ' ',
  'Escape',
]
