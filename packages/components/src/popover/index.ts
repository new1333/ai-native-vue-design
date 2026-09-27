// popover/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Popover } from './Popover.vue'

export * from './usePopover'
export * from './Popover.types'
export * from './Popover.constants'

export { meta as popoverMeta } from './Popover.meta'

import type Popover from './Popover.vue'

/** Popover 组件实例类型。 */
export type PopoverInstance = InstanceType<typeof Popover>
