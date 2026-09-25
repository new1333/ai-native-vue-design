/**
 * card/ —— CardHeader 的公共类型（Slots）。与 CardHeader.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** CardHeader 的 Slots。 */
export interface CardHeaderSlots {
  /** 头部内容：标题、元信息或操作区。 */
  default?: () => VNode[]
}
