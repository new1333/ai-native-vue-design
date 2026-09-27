// tree-select/ —— 目录唯一公共出口：组件、composable 与纯函数、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as TreeSelect } from './TreeSelect.vue'

export * from './useTreeSelect'
export * from './TreeSelect.types'
export * from './TreeSelect.constants'

export { meta as treeSelectMeta } from './TreeSelect.meta'

import type TreeSelect from './TreeSelect.vue'

/** TreeSelect 组件实例类型（含 focus/blur 暴露）。 */
export type TreeSelectInstance = InstanceType<typeof TreeSelect>
