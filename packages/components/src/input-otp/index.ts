// input-otp/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as InputOtp } from './InputOtp.vue'

export * from './useInputOtp'
export * from './InputOtp.types'
export * from './InputOtp.constants'

export { meta as inputOtpMeta } from './InputOtp.meta'

import type InputOtp from './InputOtp.vue'

/** InputOtp 组件实例类型（含 focus/blur 暴露）。 */
export type InputOtpInstance = InstanceType<typeof InputOtp>
