// artifact/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Artifact } from './Artifact.vue'

export * from './Artifact.types'
export * from './Artifact.constants'

export { meta as artifactMeta } from './Artifact.meta'

import type Artifact from './Artifact.vue'

/** Artifact 组件实例类型（含 focus 暴露）。 */
export type ArtifactInstance = InstanceType<typeof Artifact>
