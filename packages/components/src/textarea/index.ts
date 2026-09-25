// textarea/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Textarea } from './Textarea.vue'

export * from './Textarea.types'
export * from './Textarea.constants'

export { meta as textareaMeta } from './Textarea.meta'

import type Textarea from './Textarea.vue'

/** Textarea 组件实例类型（含 focus/blur 暴露）。 */
export type TextareaInstance = InstanceType<typeof Textarea>
