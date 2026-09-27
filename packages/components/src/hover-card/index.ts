// hover-card/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as HoverCard } from './HoverCard.vue'

export * from './useHoverCard'
export * from './HoverCard.types'
export * from './HoverCard.constants'

export { meta as hoverCardMeta } from './HoverCard.meta'

import type HoverCard from './HoverCard.vue'

/** HoverCard 组件实例类型。 */
export type HoverCardInstance = InstanceType<typeof HoverCard>
