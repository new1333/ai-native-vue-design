// scroll-area/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as ScrollArea } from './ScrollArea.vue'

export * from './ScrollArea.types'
export * from './ScrollArea.constants'

export { meta as scrollAreaMeta } from './ScrollArea.meta'

import type ScrollArea from './ScrollArea.vue'

/** ScrollArea 组件实例类型。 */
export type ScrollAreaInstance = InstanceType<typeof ScrollArea>
