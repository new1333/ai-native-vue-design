/**
 * date-picker/ —— 逻辑常量收口（默认文案、aria 可读名称、键盘键名、格式缺省）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { DatePickerType } from './DatePicker.types'

/** 各形态的默认占位文案（触发器上无已选值时显示）。 */
export const DATE_PICKER_PLACEHOLDER_DEFAULTS: Record<DatePickerType, string> = {
  date: '选择日期',
  datetime: '选择日期时间',
  range: '选择日期范围',
}

/** 各形态的默认序列化格式（format prop 缺省时按形态取用）。 */
export const DATE_PICKER_FORMAT_DEFAULTS: Record<DatePickerType, string> = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm',
  range: 'YYYY-MM-DD',
}

/** 默认形态。 */
export const DATE_PICKER_TYPE_DEFAULT: DatePickerType = 'date' as const

/** 面板（role="dialog"）的可读名称，按形态取用。 */
export const DATE_PICKER_PANEL_LABELS: Record<DatePickerType, string> = {
  date: '选择日期',
  datetime: '选择日期时间',
  range: '选择日期范围',
}

/** 月网格（role="grid"）的可读名称。 */
export const DATE_PICKER_GRID_ARIA_LABEL = '日历' as const

/** 清空按钮的可读名称：仅图标、无文本，必须有 aria-label。 */
export const DATE_PICKER_CLEAR_ARIA_LABEL = '清空' as const

/** 上/下月翻页按钮的可读名称（仅图标、无文本）。 */
export const DATE_PICKER_PREV_MONTH_ARIA_LABEL = '上个月' as const
export const DATE_PICKER_NEXT_MONTH_ARIA_LABEL = '下个月' as const

/** 时间输入框的可读名称。 */
export const DATE_PICKER_TIME_ARIA_LABEL = '时间' as const

/** 触发器范围值的显示分隔符。 */
export const DATE_PICKER_RANGE_SEPARATOR = ' ~ '

/** 周表头（周一首列）：short 为列内显示文本，long 为 columnheader 的 aria-label。 */
export const DATE_PICKER_WEEKDAYS: ReadonlyArray<{ short: string; long: string }> = [
  { short: '一', long: '星期一' },
  { short: '二', long: '星期二' },
  { short: '三', long: '星期三' },
  { short: '四', long: '星期四' },
  { short: '五', long: '星期五' },
  { short: '六', long: '星期六' },
  { short: '日', long: '星期日' },
]

/** 月网格总格数：6 周 × 7 列（固定 42 格，保证面板高度稳定）。 */
export const DATE_PICKER_GRID_CELLS = 42 as const

/** 一周 7 列。 */
export const DATE_PICKER_GRID_COLUMNS = 7 as const

/**
 * 月网格键盘状态机受理的键名全集（WAI-ARIA grid / date-picker-dialog 模式）：
 * ←/→/↑/↓ 移动高亮日、Home/End 行首尾、PageUp/PageDown 翻月、Enter/Space 选中。
 * （Esc/Tab 由组件层在面板 keydown 上受理：Esc 关闭并交还触发器焦点，Tab 圈定，不入此表。）
 */
export const DATE_PICKER_GRID_KEYS: readonly string[] = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Enter',
  ' ',
]

/** Tab 键名（KeyboardEvent.key）：面板（role="dialog"）焦点圈定用。 */
export const DATE_PICKER_TAB_KEY = 'Tab'

/**
 * 面板（role="dialog"）Tab 圈定的可聚焦元素选择器（DOM 序候选集，先例
 * Dialog.constants 的 DIALOG_FOCUSABLE_SELECTOR）。排除 disabled 与
 * tabindex="-1"：月网格为 roving tabindex，仅高亮格（tabindex="0"）进 Tab 序，
 * 其余 41 格不参与圈定；panel-footer 插槽内的链接/表单控件一并圈住。
 */
export const DATE_PICKER_FOCUSABLE_SELECTOR: string = [
  'a[href]',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')
