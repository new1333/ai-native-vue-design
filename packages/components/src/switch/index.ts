// switch/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Switch } from './Switch.vue'

export * from './Switch.types'
export * from './Switch.constants'

export { meta as switchMeta } from './Switch.meta'

import type Switch from './Switch.vue'

/** Switch 组件实例类型（含 focus/blur 暴露）。 */
export type SwitchInstance = InstanceType<typeof Switch>
