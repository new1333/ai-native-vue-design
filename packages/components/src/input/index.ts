// input/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Input } from './Input.vue'

export * from './Input.types'
export * from './Input.constants'

export { meta as inputMeta } from './Input.meta'

import type Input from './Input.vue'

/** Input 组件实例类型（含 focus/blur 暴露）。 */
export type InputInstance = InstanceType<typeof Input>
