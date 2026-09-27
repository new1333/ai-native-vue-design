// menu/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Menu } from './Menu.vue'
export { default as MenuItem } from './MenuItem.vue'
export { default as SubMenu } from './SubMenu.vue'

export * from './useMenu'
export * from './Menu.types'
export * from './Menu.constants'

export { meta as menuMeta } from './Menu.meta'
