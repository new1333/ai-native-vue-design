// alert/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Alert } from './Alert.vue'

export * from './Alert.types'
export * from './Alert.constants'

export { meta as alertMeta } from './Alert.meta'

import type Alert from './Alert.vue'

/** Alert 组件实例类型。 */
export type AlertInstance = InstanceType<typeof Alert>
