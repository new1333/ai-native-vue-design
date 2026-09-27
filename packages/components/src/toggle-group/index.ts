// toggle-group/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as ToggleGroup } from './ToggleGroup.vue'
export { default as ToggleItem } from './ToggleItem.vue'

export * from './ToggleGroup.types'
export * from './ToggleGroup.constants'

export { meta as toggleGroupMeta } from './ToggleGroup.meta'

import type ToggleGroup from './ToggleGroup.vue'
import type ToggleItem from './ToggleItem.vue'

/** ToggleGroup 组件实例类型（含 focus 暴露）。 */
export type ToggleGroupInstance = InstanceType<typeof ToggleGroup>

/** ToggleItem 组件实例类型（含 focus/blur 暴露）。 */
export type ToggleItemInstance = InstanceType<typeof ToggleItem>
