/**
 * button/ —— ButtonGroup 的公共类型。
 * 与 ButtonGroup.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'
import type { ButtonSize } from './Button.types'

/** ButtonGroup 的 Props。 */
export interface ButtonGroupProps {
  /** 组内共享 size；组内 Button 显式声明 size 时以自身为准。 */
  size?: ButtonSize
}

/** ButtonGroup 的 Slots。 */
export interface ButtonGroupSlots {
  /** 组内容（通常为若干 Button）。 */
  default?: () => VNode[]
}
