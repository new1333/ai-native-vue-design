// accordion/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Accordion } from './Accordion.vue'
export { useAccordion } from './useAccordion'

export * from './Accordion.types'
export * from './Accordion.constants'

export { meta as accordionMeta } from './Accordion.meta'

import type Accordion from './Accordion.vue'

/** Accordion 组件实例类型。 */
export type AccordionInstance = InstanceType<typeof Accordion>
