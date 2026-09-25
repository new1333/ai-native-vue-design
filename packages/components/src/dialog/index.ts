// dialog/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Dialog } from './Dialog.vue'

export * from './useDialog'
export * from './Dialog.types'
export * from './Dialog.constants'

export { meta as dialogMeta } from './Dialog.meta'

import type Dialog from './Dialog.vue'

/** Dialog 组件实例类型（含 focus 暴露）。 */
export type DialogInstance = InstanceType<typeof Dialog>
