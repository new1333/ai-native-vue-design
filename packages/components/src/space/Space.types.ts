/**
 * space/ —— Space 的公共类型（Props / Slots）。
 * 与 Space.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 排列方向：row 横向（默认）/ column 纵向。 */
export type SpaceDirection = 'row' | 'column'

/** 间距档位：sm / md / lg，映射 --ui-space-2 / --ui-space-4 / --ui-space-6。 */
export type SpaceSize = 'sm' | 'md' | 'lg'

/** 交叉轴对齐（flex align-items）：默认 center。 */
export type SpaceAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch'

/** Space 的 Props。 */
export interface SpaceProps {
  /** 排列方向，默认 'row'。 */
  direction?: SpaceDirection
  /** 间距档位，默认 'md'；sm/md/lg 分别映射 --ui-space-2/--ui-space-4/--ui-space-6。 */
  size?: SpaceSize
  /** 是否允许换行（flex-wrap: wrap），默认 false。 */
  wrap?: boolean
  /** 交叉轴对齐（align-items），默认 'center'。 */
  align?: SpaceAlign
}

/** Space 的 Slots。 */
export interface SpaceSlots {
  /** 需要排列的子元素；容器不加逐子元素包裹层，间距由 flex gap 承担。 */
  default?: () => VNode[]
}
