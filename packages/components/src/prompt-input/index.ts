// prompt-input/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as PromptInput } from './PromptInput.vue'

export * from './usePromptInputAutosize'
export * from './PromptInput.types'
export * from './PromptInput.constants'

export { meta as promptInputMeta } from './PromptInput.meta'

import type PromptInput from './PromptInput.vue'

/** PromptInput 组件实例类型（含 focus/blur 暴露）。 */
export type PromptInputInstance = InstanceType<typeof PromptInput>
