// checkbox/ —— 目录唯一公共出口：组件、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Checkbox } from './Checkbox.vue'

export * from './Checkbox.types'

export { meta as checkboxMeta } from './Checkbox.meta'

import type Checkbox from './Checkbox.vue'

/** Checkbox 组件实例类型（含 focus/blur 暴露）。 */
export type CheckboxInstance = InstanceType<typeof Checkbox>
