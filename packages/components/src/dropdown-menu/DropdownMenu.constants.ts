/**
 * dropdown-menu/ —— 逻辑常量收口（键名、选择器、aria 值；不是视觉值，视觉只走 --ui-* token）。
 */
import type { DropdownMenuAlign } from './DropdownMenu.types'

/** align 全集（与 DropdownMenu.types.ts 的 DropdownMenuAlign 一一对应）。 */
export const DROPDOWN_MENU_ALIGNS = ['start', 'end'] as const

/** 默认对齐。 */
export const DROPDOWN_MENU_ALIGN_DEFAULT: DropdownMenuAlign = 'start'

/** 触发器 aria-haspopup 的值（WAI-ARIA menu 模式）。 */
export const DROPDOWN_MENU_HASPOPUP = 'menu' as const

/** 键名（KeyboardEvent.key）。 */
export const DROPDOWN_MENU_KEY_ARROW_DOWN = 'ArrowDown'
export const DROPDOWN_MENU_KEY_ARROW_UP = 'ArrowUp'
export const DROPDOWN_MENU_KEY_ENTER = 'Enter'
export const DROPDOWN_MENU_KEY_SPACE = ' '
export const DROPDOWN_MENU_KEY_ESCAPE = 'Escape'
export const DROPDOWN_MENU_KEY_TAB = 'Tab'
export const DROPDOWN_MENU_KEY_HOME = 'Home'
export const DROPDOWN_MENU_KEY_END = 'End'

/** 菜单项元素选择器（roving focus 查询用；DOM 序与 items 一致，含 disabled 项以保序）。 */
export const DROPDOWN_MENU_ITEM_SELECTOR = '[role="menuitem"]'

/** items 为空时的默认空态文案（对齐 select/ 家族空态先例命名与文案）。 */
export const DROPDOWN_MENU_EMPTY_TEXT_DEFAULT = '暂无选项' as const
