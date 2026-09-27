// spinner/ —— 目录唯一公共出口：组件、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Spinner } from './Spinner.vue'

export * from './Spinner.types'

export { meta as spinnerMeta } from './Spinner.meta'

import type Spinner from './Spinner.vue'

/** Spinner 组件实例类型（纯展示组件，无暴露方法）。 */
export type SpinnerInstance = InstanceType<typeof Spinner>
