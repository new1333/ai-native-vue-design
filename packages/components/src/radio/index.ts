// radio/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Radio } from './Radio.vue'
export { default as RadioGroup } from './RadioGroup.vue'

export * from './Radio.types'
export * from './Radio.constants'

export { meta as radioMeta } from './Radio.meta'
export { meta as radioGroupMeta } from './RadioGroup.meta'

import type Radio from './Radio.vue'
import type RadioGroup from './RadioGroup.vue'

/** Radio 组件实例类型（含 focus/blur 暴露）。 */
export type RadioInstance = InstanceType<typeof Radio>

/** RadioGroup 组件实例类型。 */
export type RadioGroupInstance = InstanceType<typeof RadioGroup>
