// tooltip/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Tooltip } from './Tooltip.vue'

export * from './useTooltip'
export * from './Tooltip.types'
export * from './Tooltip.constants'

export { meta as tooltipMeta } from './Tooltip.meta'

import type Tooltip from './Tooltip.vue'

/** Tooltip 组件实例类型。 */
export type TooltipInstance = InstanceType<typeof Tooltip>
