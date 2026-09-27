/**
 * command-palette/ —— 逻辑常量收口（键名、aria 值、默认文案；不是视觉值，视觉只走 --ui-* token）。
 */

/** 键名（KeyboardEvent.key）：搜索输入框上的键盘契约。 */
export const COMMAND_PALETTE_KEY_ARROW_DOWN = 'ArrowDown'
export const COMMAND_PALETTE_KEY_ARROW_UP = 'ArrowUp'
export const COMMAND_PALETTE_KEY_HOME = 'Home'
export const COMMAND_PALETTE_KEY_END = 'End'
export const COMMAND_PALETTE_KEY_ENTER = 'Enter'

/** 热键主键（与 KeyboardEvent.key 小写比较；修饰键为 metaKey / ctrlKey，即 Cmd/Ctrl+K）。 */
export const COMMAND_PALETTE_HOTKEY_KEY = 'k'

/** 默认搜索占位文本。 */
export const COMMAND_PALETTE_PLACEHOLDER_DEFAULT = '搜索命令…'

/** 未提供 header 插槽时面板（role="dialog"）的 aria-label。 */
export const COMMAND_PALETTE_DIALOG_LABEL = '命令面板'

/** listbox 的 aria-label。 */
export const COMMAND_PALETTE_LISTBOX_LABEL = '命令列表'

/** 无匹配结果的默认文案（empty 插槽回退）。 */
export const COMMAND_PALETTE_EMPTY_TEXT = '无匹配命令'
