// autocomplete/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as AutoComplete } from './AutoComplete.vue'

export * from './useAutoComplete'
export * from './AutoComplete.types'
export * from './AutoComplete.constants'

export { meta as autoCompleteMeta } from './AutoComplete.meta'

import type AutoComplete from './AutoComplete.vue'

/** AutoComplete 组件实例类型（含 focus/blur 暴露）。 */
export type AutoCompleteInstance = InstanceType<typeof AutoComplete>
