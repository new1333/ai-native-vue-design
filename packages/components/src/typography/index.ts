// typography/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Text } from './Text.vue'
export { default as Heading } from './Heading.vue'

export * from './Typography.types'
export * from './Typography.constants'
export * from './Text.types'
export * from './Text.constants'
export * from './Heading.types'
export * from './Heading.constants'

export { meta as textMeta } from './Text.meta'
export { meta as headingMeta } from './Heading.meta'

import type Text from './Text.vue'
import type Heading from './Heading.vue'

/** Text 组件实例类型。 */
export type TextInstance = InstanceType<typeof Text>

/** Heading 组件实例类型。 */
export type HeadingInstance = InstanceType<typeof Heading>
