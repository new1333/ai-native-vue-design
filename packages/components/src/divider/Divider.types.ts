/**
 * divider/ —— Divider 的公共类型（Props / Slots）。
 * 与 Divider.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 分隔方向。 */
export type DividerDirection = 'horizontal' | 'vertical'

/** Divider 的 Props。 */
export interface DividerProps {
  /** 分隔方向，默认 'horizontal'；水平无标签时渲染语义 <hr>。 */
  direction?: DividerDirection
}

/** Divider 的 Slots。 */
export interface DividerSlots {
  /** 分隔线标签（仅水平方向生效）：居中展示，两侧细线。提供标签后改渲染 div[role="separator"]。 */
  label?: () => VNode[]
}
