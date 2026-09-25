// empty-state/ —— 目录唯一公共出口：组件、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as EmptyState } from './EmptyState.vue'

export * from './EmptyState.types'

export { meta as emptyStateMeta } from './EmptyState.meta'

import type EmptyState from './EmptyState.vue'

/** EmptyState 组件实例类型。 */
export type EmptyStateInstance = InstanceType<typeof EmptyState>
