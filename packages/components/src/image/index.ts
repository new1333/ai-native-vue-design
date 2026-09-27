// image/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Image } from './Image.vue'

export * from './useImage'
export * from './Image.types'
export * from './Image.constants'

export { meta as imageMeta } from './Image.meta'

import type Image from './Image.vue'

/** Image 组件实例类型（纯展示 + 内部状态机，无 exposes 暴露方法）。 */
export type ImageInstance = InstanceType<typeof Image>
