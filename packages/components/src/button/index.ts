// button/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Button } from './Button.vue'
export { default as ButtonRoot } from './ButtonRoot.vue'
export { default as ButtonGroup } from './ButtonGroup.vue'

export * from './useButton'
export * from './Button.types'
export * from './ButtonGroup.types'
export * from './Button.constants'

export { meta as buttonMeta } from './Button.meta'
export { meta as buttonGroupMeta } from './ButtonGroup.meta'

import type Button from './Button.vue'
import type ButtonGroup from './ButtonGroup.vue'

/** Button 组件实例类型（含 focus/blur 暴露）。 */
export type ButtonInstance = InstanceType<typeof Button>

/** ButtonGroup 组件实例类型。 */
export type ButtonGroupInstance = InstanceType<typeof ButtonGroup>
