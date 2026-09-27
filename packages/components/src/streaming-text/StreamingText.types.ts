/**
 * streaming-text/ —— StreamingText 的公共类型（Props / Emits / Slots）。
 * 与 StreamingText.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** StreamingText 的 Props。 */
export interface StreamingTextProps {
  /** 增量全文：当前已接收的完整累计文本（服务端每追加一段 token 就整体更新它）。 */
  content: string
  /** 是否流式进行中：true 时增量按节拍上屏并渲染光标；false 时定格全文。默认 false。 */
  streaming?: boolean
  /** 段落结构化：按空行切分原生 p 段落、段内换行保留；非完整 Markdown 解析。默认 false。 */
  markdown?: boolean
}

/** StreamingText 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface StreamingTextEmits {
  /** 流结束（streaming true→false）时触发一次：组件已定格为 content 全文并移除光标。 */
  complete: []
}

/** StreamingText 的 Slots。 */
export interface StreamingTextSlots {
  /**
   * 接管「已上屏文本」的渲染（内置纯文本/段落结构不渲染，光标仍由组件收口）。
   * 作用域：text = 已上屏文本；streaming = 是否流式进行中。
   */
  default?: (scope: { text: string; streaming: boolean }) => VNode[]
  /** 自定义流式光标（默认块状插入符，装饰性 aria-hidden）。 */
  cursor?: () => VNode[]
}
