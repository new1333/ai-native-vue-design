/**
 * typography/ —— Text 的公共类型（Props / Slots）。
 * 与 Text.meta.ts 的 api 字段保持一致；共享档位类型见 Typography.types.ts。
 */
import type { VNode } from 'vue'
import type { TextAs, TypographyColor, TypographySize, TypographyWeight } from './Typography.types'

/** Text 的 Props。 */
export interface TextProps {
  /** 渲染的元素标签，默认 'span'；正文段落建议 'p'。 */
  as?: TextAs
  /** 字号档位，映射 --ui-text-*，默认 'md'（15px 正文）。 */
  size?: TypographySize
  /** 字重 400/500/600，默认 400（regular）。 */
  weight?: TypographyWeight
  /** 颜色语义档位，默认 'text-1'；'muted' 为 'text-2' 的简写。 */
  color?: TypographyColor
  /** 数字场景：font-variant-numeric 采用 --ui-numeric（tabular-nums），默认关闭。 */
  numeric?: boolean
}

/** Text 的 Slots。 */
export interface TextSlots {
  /** 文本内容。 */
  default?: () => VNode[]
}
