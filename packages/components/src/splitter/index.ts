// splitter/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Splitter } from './Splitter.vue'
export { default as SplitterPane } from './SplitterPane.vue'
export { useSplitter } from './useSplitter'

export * from './Splitter.types'
export * from './Splitter.constants'

export { meta as splitterMeta } from './Splitter.meta'

import type Splitter from './Splitter.vue'
import type SplitterPane from './SplitterPane.vue'

/** Splitter 组件实例类型。 */
export type SplitterInstance = InstanceType<typeof Splitter>

/** SplitterPane 组件实例类型。 */
export type SplitterPaneInstance = InstanceType<typeof SplitterPane>
