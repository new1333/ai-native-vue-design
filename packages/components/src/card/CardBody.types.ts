/**
 * card/ —— CardBody 的公共类型（Slots）。与 CardBody.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** CardBody 的 Slots。 */
export interface CardBodySlots {
  /** 主体内容：正文、表单、图表等。 */
  default?: () => VNode[]
}
