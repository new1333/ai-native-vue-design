// rating/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Rating } from './Rating.vue'

export * from './Rating.types'
export * from './Rating.constants'

export { meta as ratingMeta } from './Rating.meta'

import type Rating from './Rating.vue'

/** Rating 组件实例类型（含 focus/blur 暴露）。 */
export type RatingInstance = InstanceType<typeof Rating>
