// message-list/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as MessageList } from './MessageList.vue'

export * from './useMessageListScroll'
export * from './MessageList.types'
export * from './MessageList.constants'

export { meta as messageListMeta } from './MessageList.meta'
