// popconfirm/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Popconfirm } from './Popconfirm.vue'

export * from './usePopconfirm'
export * from './Popconfirm.types'
export * from './Popconfirm.constants'

export { meta as popconfirmMeta } from './Popconfirm.meta'

import type Popconfirm from './Popconfirm.vue'

/** Popconfirm 组件实例类型。 */
export type PopconfirmInstance = InstanceType<typeof Popconfirm>
