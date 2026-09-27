// layout/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Layout } from './Layout.vue'
export { default as LayoutHeader } from './LayoutHeader.vue'
export { default as LayoutSider } from './LayoutSider.vue'
export { default as LayoutContent } from './LayoutContent.vue'
export { default as LayoutFooter } from './LayoutFooter.vue'

export * from './Layout.types'
export * from './Layout.constants'
export * from './useLayout'

export { meta as layoutMeta } from './Layout.meta'

import type Layout from './Layout.vue'
import type LayoutHeader from './LayoutHeader.vue'
import type LayoutSider from './LayoutSider.vue'
import type LayoutContent from './LayoutContent.vue'
import type LayoutFooter from './LayoutFooter.vue'

/** Layout 组件实例类型。 */
export type LayoutInstance = InstanceType<typeof Layout>

/** LayoutHeader 组件实例类型。 */
export type LayoutHeaderInstance = InstanceType<typeof LayoutHeader>

/** LayoutSider 组件实例类型。 */
export type LayoutSiderInstance = InstanceType<typeof LayoutSider>

/** LayoutContent 组件实例类型。 */
export type LayoutContentInstance = InstanceType<typeof LayoutContent>

/** LayoutFooter 组件实例类型。 */
export type LayoutFooterInstance = InstanceType<typeof LayoutFooter>
