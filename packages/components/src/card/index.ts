// card/ —— 目录唯一公共出口：组件、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Card } from './Card.vue'
export { default as CardHeader } from './CardHeader.vue'
export { default as CardBody } from './CardBody.vue'
export { default as CardFooter } from './CardFooter.vue'

export * from './Card.types'
export * from './CardHeader.types'
export * from './CardBody.types'
export * from './CardFooter.types'
export * from './Card.constants'

export { meta as cardMeta } from './Card.meta'
export { meta as cardHeaderMeta } from './CardHeader.meta'
export { meta as cardBodyMeta } from './CardBody.meta'
export { meta as cardFooterMeta } from './CardFooter.meta'

import type Card from './Card.vue'
import type CardHeader from './CardHeader.vue'
import type CardBody from './CardBody.vue'
import type CardFooter from './CardFooter.vue'

/** Card 组件实例类型。 */
export type CardInstance = InstanceType<typeof Card>

/** CardHeader 组件实例类型。 */
export type CardHeaderInstance = InstanceType<typeof CardHeader>

/** CardBody 组件实例类型。 */
export type CardBodyInstance = InstanceType<typeof CardBody>

/** CardFooter 组件实例类型。 */
export type CardFooterInstance = InstanceType<typeof CardFooter>
