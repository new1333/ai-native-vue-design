// divider/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Divider } from './Divider.vue'

export * from './Divider.types'
export * from './Divider.constants'

export { meta as dividerMeta } from './Divider.meta'

import type Divider from './Divider.vue'

/** Divider 组件实例类型。 */
export type DividerInstance = InstanceType<typeof Divider>
