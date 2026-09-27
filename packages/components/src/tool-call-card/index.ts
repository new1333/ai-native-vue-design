// tool-call-card/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as ToolCallCard } from './ToolCallCard.vue'

export * from './ToolCallCard.types'
export * from './ToolCallCard.constants'

export { meta as toolCallCardMeta } from './ToolCallCard.meta'

import type ToolCallCard from './ToolCallCard.vue'

/** ToolCallCard 组件实例类型。 */
export type ToolCallCardInstance = InstanceType<typeof ToolCallCard>
