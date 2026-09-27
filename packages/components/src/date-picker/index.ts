// date-picker/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as DatePicker } from './DatePicker.vue'

export * from './useDatePicker'
export * from './DatePicker.types'
export * from './DatePicker.constants'

export { meta as datePickerMeta } from './DatePicker.meta'

import type DatePicker from './DatePicker.vue'

/** DatePicker 组件实例类型（含 focus/blur 暴露）。 */
export type DatePickerInstance = InstanceType<typeof DatePicker>
