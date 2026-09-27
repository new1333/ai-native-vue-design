// streaming-text/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as StreamingText } from './StreamingText.vue'

export * from './StreamingText.types'
export * from './StreamingText.constants'

export { meta as streamingTextMeta } from './StreamingText.meta'

import type StreamingText from './StreamingText.vue'

/** StreamingText 组件实例类型。 */
export type StreamingTextInstance = InstanceType<typeof StreamingText>
