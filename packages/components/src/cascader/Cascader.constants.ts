/**
 * cascader/ —— 逻辑常量收口（默认文案、键盘键名、面板可读名称、拼接符）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */

/** 默认占位文案（触发器上无已选值时显示）。 */
export const CASCADER_PLACEHOLDER_DEFAULT = '请选择' as const

/** 默认空态文案（options 为空数组时弹层内显示）。 */
export const CASCADER_EMPTY_TEXT_DEFAULT = '暂无选项' as const

/** 单条路径内 label 的拼接符（触发器文案，如「浙江省 / 杭州市」）。 */
export const CASCADER_PATH_SEPARATOR = ' / ' as const

/** 多选时多条路径文案的拼接符（触发器文案）。 */
export const CASCADER_PATHS_SEPARATOR = '、' as const

/** 根级面板的可读名称（role=listbox 的 aria-label）。 */
export const CASCADER_ROOT_PANEL_LABEL = '一级候选' as const

/**
 * 键盘状态机受理的键名全集（combobox + 分栏 listbox 面板导航）：
 * ↓/↑ 当前面板内移动高亮、→ 进入子级面板、← 返回上级面板、
 * Home/End 首尾、Enter/Space 提交或展开、Esc 关闭。
 */
export const CASCADER_NAVIGATION_KEYS: readonly string[] = [
  'ArrowDown',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'Home',
  'End',
  'Enter',
  ' ',
  'Escape',
]
