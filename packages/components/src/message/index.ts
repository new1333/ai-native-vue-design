// message/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Message } from './Message.vue'

export * from './Message.types'
export * from './Message.constants'

export { meta as messageMeta } from './Message.meta'

import type Message from './Message.vue'

/** Message 组件实例类型。 */
export type MessageInstance = InstanceType<typeof Message>
