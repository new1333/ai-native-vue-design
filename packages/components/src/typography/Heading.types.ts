/**
 * typography/ —— Heading 的公共类型（Props / Slots）。
 * 与 Heading.meta.ts 的 api 字段保持一致；共享档位类型见 Typography.types.ts。
 */
import type { VNode } from 'vue'
import type { HeadingAs, TypographyColor, TypographySize, TypographyWeight } from './Typography.types'

/** Heading 的 Props。 */
export interface HeadingProps {
  /** 标题层级，默认 'h2'（页面主标题之外的常规层级；h1 每页至多一个）。 */
  as?: HeadingAs
  /** 字号档位，映射 --ui-text-*，默认 'xl'（20px）。 */
  size?: TypographySize
  /** 字重 400/500/600，默认 600（semibold）。 */
  weight?: TypographyWeight
  /** 颜色语义档位，默认 'text-1'；'muted' 为 'text-2' 的简写。 */
  color?: TypographyColor
  /** 数字场景：font-variant-numeric 采用 --ui-numeric（tabular-nums），默认关闭。 */
  numeric?: boolean
}

/** Heading 的 Slots。 */
export interface HeadingSlots {
  /** 标题文本。 */
  default?: () => VNode[]
}
