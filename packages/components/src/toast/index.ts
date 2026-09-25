// toast/ —— 目录唯一公共出口：toast 单例（默认导出 + 命名导出）、ToastHost、公共类型、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default, default as toast } from './toast'
export { default as ToastHost } from './ToastHost.vue'

export * from './ToastHost.types'
export * from './useToastTimer'
export * from './ToastHost.constants'

export { meta as toastMeta } from './ToastHost.meta'

import type ToastHost from './ToastHost.vue'

/** ToastHost 组件实例类型。 */
export type ToastHostInstance = InstanceType<typeof ToastHost>
