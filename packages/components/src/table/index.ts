// table/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Table } from './Table.vue'

export * from './useTableSort'
export * from './Table.types'
export * from './Table.constants'

export { meta as tableMeta } from './Table.meta'
