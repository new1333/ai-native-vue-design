// breadcrumb/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Breadcrumb } from './Breadcrumb.vue'

export * from './Breadcrumb.types'
export * from './Breadcrumb.constants'
export * from './useBreadcrumb'

export { meta as breadcrumbMeta } from './Breadcrumb.meta'
