/**
 * input-otp/ —— InputOtp 的公共类型（Props / Emits / Slots / Expose）。
 * 与 InputOtp.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 软键盘类型：numeric = 数字验证码；alphanumeric = 字母数字混合验证码。 */
export type InputOtpInputMode = 'numeric' | 'alphanumeric'

/** InputOtp 的 Props。 */
export interface InputOtpProps {
  /** v-model 绑定值（string，受控）：全部格子按序拼接；不足 length 的尾部为空格位。 */
  modelValue?: string
  /** 格数（>= 1），默认 6；非法值回退默认。 */
  length?: number
  /** 密码型展示：格子渲染为 type="password"（逐格掩码，不整段掩码）。 */
  masked?: boolean
  /** 软键盘类型与字符过滤口径，默认 'numeric'；numeric 只接受 0-9，alphanumeric 接受 0-9 与英文字母。 */
  inputMode?: InputOtpInputMode
  /** 禁用：全部格子原生 disabled（移出 Tab 序），拦截输入/粘贴/键盘路径。 */
  disabled?: boolean
}

/** InputOtp 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface InputOtpEmits {
  /** v-model 更新：用户路径（逐格输入 / 粘贴分发 / 回退删除）导致值实际变化时发出。 */
  'update:modelValue': [value: string]
  /** 本次变化后全部格位已填满时触发（载荷为拼接后的完整值；初值满格不触发）。 */
  complete: [value: string]
}

/** InputOtp 的 Slots。 */
export interface InputOtpSlots {
  /**
   * 格间分隔内容：渲染于每个间隙（length - 1 处），按装饰处理（aria-hidden="true"），
   * 通常是「-」或竖线等分组符号。
   */
  separator?: () => VNode[]
}

/** InputOtp 对外暴露的实例方法。 */
export interface InputOtpExpose {
  /** 聚焦第 index 格（默认第 0 格；仅客户端有意义）。 */
  focus: (index?: number) => void
  /** 移除全部格子焦点。 */
  blur: () => void
}
