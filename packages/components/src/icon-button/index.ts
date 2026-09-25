// icon-button/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as IconButton } from './IconButton.vue'

export * from './IconButton.types'
export * from './IconButton.constants'

export { meta as iconButtonMeta } from './IconButton.meta'

import type IconButton from './IconButton.vue'

/** IconButton 组件实例类型（含 focus/blur 暴露）。 */
export type IconButtonInstance = InstanceType<typeof IconButton>
