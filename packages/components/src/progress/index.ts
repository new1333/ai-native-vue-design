// progress/ —— 目录唯一公共出口：组件、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Progress } from './Progress.vue'

export * from './Progress.types'

export { meta as progressMeta } from './Progress.meta'

import type Progress from './Progress.vue'

/** Progress 组件实例类型（纯展示组件，无暴露方法）。 */
export type ProgressInstance = InstanceType<typeof Progress>
