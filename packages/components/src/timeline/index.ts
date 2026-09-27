// timeline/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Timeline } from './Timeline.vue'

export * from './Timeline.types'

export * from './Timeline.constants'

export { meta as timelineMeta } from './Timeline.meta'

import type Timeline from './Timeline.vue'

/** Timeline 组件实例类型（纯展示组件，无暴露方法）。 */
export type TimelineInstance = InstanceType<typeof Timeline>
