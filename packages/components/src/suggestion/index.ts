// suggestion/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Suggestion } from './Suggestion.vue'

export * from './useSuggestion'
export * from './Suggestion.types'
export * from './Suggestion.constants'

export { meta as suggestionMeta } from './Suggestion.meta'
