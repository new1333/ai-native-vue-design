/**
 * card/ —— Card 的公共类型（Props / Slots）。与 Card.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 阴影档位：none 为静止面默认无阴影；rest 为设计文档唯一可选的静止阴影档。 */
export type CardShadow = 'none' | 'rest'

/** Card 的 Props。 */
export interface CardProps {
  /** 阴影档位，默认 'none'（静止面默认无阴影）；'rest' 应用 --ui-shadow-rest 一档静止阴影。 */
  shadow?: CardShadow
}

/** Card 的 Slots。 */
export interface CardSlots {
  /** 卡片内容：通常为 CardHeader / CardBody / CardFooter 的组合，也可以是任意内容。 */
  default?: () => VNode[]
}
