// command-palette/ —— 目录唯一公共出口：组件、composable、公共类型、meta、constants。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as CommandPalette } from './CommandPalette.vue'

export * from './useCommandPalette'
export * from './CommandPalette.types'
export * from './CommandPalette.constants'

export { meta as commandPaletteMeta } from './CommandPalette.meta'

import type CommandPalette from './CommandPalette.vue'

/** CommandPalette 组件实例类型。 */
export type CommandPaletteInstance = InstanceType<typeof CommandPalette>
