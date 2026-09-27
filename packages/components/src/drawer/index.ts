// drawer/ —— 目录唯一公共出口：组件、composable、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Drawer } from './Drawer.vue'

export * from './useDrawer'
export * from './Drawer.types'
export * from './Drawer.constants'

export { meta as drawerMeta } from './Drawer.meta'

import type Drawer from './Drawer.vue'

/** Drawer 组件实例类型（含 focus 暴露）。 */
export type DrawerInstance = InstanceType<typeof Drawer>
