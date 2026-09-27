// upload/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Upload } from './Upload.vue'

export * from './useUpload'
export * from './Upload.types'
export * from './Upload.constants'

export { meta as uploadMeta } from './Upload.meta'

import type Upload from './Upload.vue'

/** Upload 组件实例类型。 */
export type UploadInstance = InstanceType<typeof Upload>
