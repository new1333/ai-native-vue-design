// model-selector/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as ModelSelector } from './ModelSelector.vue'

export * from './useModelSelector'
export * from './ModelSelector.types'
export * from './ModelSelector.constants'

export { meta as modelSelectorMeta } from './ModelSelector.meta'

import type ModelSelector from './ModelSelector.vue'

/** ModelSelector 组件实例类型（含 focus/blur 暴露）。 */
export type ModelSelectorInstance = InstanceType<typeof ModelSelector>
