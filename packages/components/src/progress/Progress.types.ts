/**
 * progress/ —— Progress 的公共类型（Props / Slots）。
 * 与 Progress.meta.ts 的 api 字段保持一致。
 */

/** 条高档位。 */
export type ProgressSize = 'sm' | 'md'

/** Progress 的 Props。 */
export interface ProgressProps {
  /** 确定进度值 0-100（越界钳制、非有限数回退 0）；indeterminate=true 时忽略。 */
  value?: number
  /** 不确定进度：忽略 value、省略 aria-valuenow、播放扫描动画（reduced-motion 降级为静态半填充）。 */
  indeterminate?: boolean
  /** 显示数值标签（如 "42%"）；仅确定进度渲染，indeterminate 下无确定值不渲染。 */
  showLabel?: boolean
  /** 条高档位，默认 'md'。 */
  size?: ProgressSize
}

/** Progress 的 Slots（无插槽：内容由 props 驱动）。 */
export interface ProgressSlots {}
