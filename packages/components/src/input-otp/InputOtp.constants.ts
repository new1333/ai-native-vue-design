/**
 * input-otp/ —— 逻辑常量收口（类型全集、默认值、键盘受理集、格子可读名称）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { InputOtpInputMode } from './InputOtp.types'

/** 支持的软键盘类型全集（与 InputOtp.types.ts 的 InputOtpInputMode 一一对应）。 */
export const INPUT_OTP_INPUT_MODES = [
  'numeric',
  'alphanumeric',
] as const satisfies readonly InputOtpInputMode[]

/** 默认软键盘类型。 */
export const INPUT_OTP_INPUT_MODE_DEFAULT = 'numeric' as const

/** 默认格数。 */
export const INPUT_OTP_LENGTH_DEFAULT = 6

/** 最小格数（length 非法回退默认前的下界）。 */
export const INPUT_OTP_LENGTH_MIN = 1

/** 首格的 autocomplete 值：供浏览器 / 短信验证码自动填充识别一次性口令语义。 */
export const INPUT_OTP_CELL_AUTOCOMPLETE = 'one-time-code'

/** 键盘受理键全集（keydown 拦截并接管；字符输入走 input 事件路径，不在此列）。 */
export const INPUT_OTP_KEYS = [
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
] as const

/** 每格的可读名称：格子无可见文本语义（掩码下尤其如此），必须有 aria-label。 */
export function inputOtpCellAriaLabel(index: number, total: number): string {
  return `第 ${index + 1} 位，共 ${total} 位`
}
