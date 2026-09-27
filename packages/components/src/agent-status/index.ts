// agent-status/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as AgentStatus } from './AgentStatus.vue'

export * from './AgentStatus.types'
export * from './AgentStatus.constants'

export { meta as agentStatusMeta } from './AgentStatus.meta'

import type AgentStatus from './AgentStatus.vue'

/** AgentStatus 组件实例类型（纯展示组件，无暴露方法）。 */
export type AgentStatusInstance = InstanceType<typeof AgentStatus>
