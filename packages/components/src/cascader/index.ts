// cascader/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Cascader } from './Cascader.vue'

export * from './useCascader'
export * from './Cascader.types'
export * from './Cascader.constants'

export { meta as cascaderMeta } from './Cascader.meta'

import type Cascader from './Cascader.vue'

/** Cascader 组件实例类型（含 focus/blur 暴露）。 */
export type CascaderInstance = InstanceType<typeof Cascader>
