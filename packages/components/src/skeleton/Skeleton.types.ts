/**
 * skeleton/ —— Skeleton 的公共类型（Props / Slots）。
 * 与 Skeleton.meta.ts 的 api 字段保持一致。
 */

/** 骨架形状档位。 */
export type SkeletonVariant = 'line' | 'circle' | 'rect'

/** 宽高维度：数字按 px 处理，字符串原样透传（如 '50%'、'10em'）。 */
export type SkeletonDimension = string | number

/** Skeleton 的 Props。 */
export interface SkeletonProps {
  /** 骨架形状，默认 'line'（多行文本占位）；circle 正圆、rect 矩形。 */
  variant?: SkeletonVariant
  /** variant='line' 时的行数（最小 1，小数向下取整）；末行渲染短尾。其余形状忽略。 */
  lines?: number
  /** 宽度；circle 时优先作为正圆直径（与 height 同源）。 */
  width?: SkeletonDimension
  /** 高度；line 时为每行行高，circle 时仅在缺 width 时作为直径。 */
  height?: SkeletonDimension
}

/** Skeleton 的 Slots（无插槽：占位完全由 props 驱动）。 */
export interface SkeletonSlots {}
