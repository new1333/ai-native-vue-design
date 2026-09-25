/**
 * card/ —— CardFooter 的公共类型（Slots）。与 CardFooter.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** CardFooter 的 Slots。 */
export interface CardFooterSlots {
  /** 底部内容：动作按钮组或补充说明。 */
  default?: () => VNode[]
}
