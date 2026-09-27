// input-number/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as InputNumber } from './InputNumber.vue'

export * from './useInputNumber'
export * from './InputNumber.types'
export * from './InputNumber.constants'

export { meta as inputNumberMeta } from './InputNumber.meta'

import type InputNumber from './InputNumber.vue'

/** InputNumber 组件实例类型（含 focus/blur 暴露）。 */
export type InputNumberInstance = InstanceType<typeof InputNumber>
