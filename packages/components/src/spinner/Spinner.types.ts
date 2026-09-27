/**
 * spinner/ —— Spinner 的公共类型（Props / Slots）。
 * 与 Spinner.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 视觉变体：spin 旋转环 / dots 三点脉冲。 */
export type SpinnerVariant = 'spin' | 'dots'

/** 尺寸档位：spin 外径 sm 16 / md 24 / lg 32；dots 圆点与间距随档缩放。 */
export type SpinnerSize = 'sm' | 'md' | 'lg'

/** Spinner 的 Props。 */
export interface SpinnerProps {
  /**
   * 可访问名（必配）：加载状态文本，以 sr-only 形式渲染在 role="status" 内，
   * 读屏据此播报加载状态；图形本体（svg / dots）对读屏隐藏。
   * 需要更丰富的状态描述时用 #label 插槽覆盖。
   */
  label: string
  /** 视觉变体：spin（旋转环，默认）/ dots（三点 opacity 脉冲）。 */
  variant?: SpinnerVariant
  /** 尺寸档位，默认 'md'。 */
  size?: SpinnerSize
}

/** Spinner 的 Slots。 */
export interface SpinnerSlots {
  /** 可访问名内容：覆盖 label 文本（仍以 sr-only 渲染在 role="status" 内）。 */
  label?: () => VNode[]
}
