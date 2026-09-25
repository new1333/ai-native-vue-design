// pagination/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Pagination } from './Pagination.vue'

export * from './usePagination'
export * from './Pagination.types'
export * from './Pagination.constants'

export { meta as paginationMeta } from './Pagination.meta'

import type Pagination from './Pagination.vue'

/** Pagination 组件实例类型。 */
export type PaginationInstance = InstanceType<typeof Pagination>
