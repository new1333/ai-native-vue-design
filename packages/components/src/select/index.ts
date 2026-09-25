// select/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Select } from './Select.vue'

export * from './useSelect'
export * from './Select.types'
export * from './Select.constants'

export { meta as selectMeta } from './Select.meta'

import type Select from './Select.vue'

/** Select 组件实例类型（含 focus/blur 暴露）。 */
export type SelectInstance = InstanceType<typeof Select>
