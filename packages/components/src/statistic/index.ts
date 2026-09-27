// statistic/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Statistic } from './Statistic.vue'

export * from './useCountdown'
export * from './Statistic.types'
export * from './Statistic.constants'

export { meta as statisticMeta } from './Statistic.meta'

import type Statistic from './Statistic.vue'

/** Statistic 组件实例类型（纯展示组件，无暴露方法）。 */
export type StatisticInstance = InstanceType<typeof Statistic>
