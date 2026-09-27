/**
 * reasoning/ —— Reasoning 的公共类型（Props / Emits / Slots / 作用域对象）。
 * 与 Reasoning.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** header 插槽作用域。 */
export interface ReasoningHeaderScope {
  /** 当前是否展开。 */
  expanded: boolean
  /** 是否思考流式进行中。 */
  streaming: boolean
  /** 思考耗时（秒）：仅使用方传入 duration 时存在。 */
  duration?: number
}

/** content 插槽作用域。 */
export interface ReasoningContentScope {
  /** 累计思考文本（content prop 原值）。 */
  content: string
  /** 是否思考流式进行中。 */
  streaming: boolean
}

/** Reasoning 的 Props。 */
export interface ReasoningProps {
  /** 思考过程文本（累计全文），多行换行按 pre-wrap 保留；用 content 插槽时可缺省。默认 ''。 */
  content?: string
  /**
   * 是否思考流式进行中：false→true 自动展开；true→false 且 autoCollapse 时自动收起。
   * 头部文案随之在「思考中…」与完成态之间切换。默认 false。
   */
  streaming?: boolean
  /** 思考耗时（秒，展示固定一位小数）：完成态头部展示「已思考 x.xs」；不传则完成态展示「思考过程」。 */
  duration?: number
  /** 流式结束（streaming true→false）时是否自动收起。默认 true。 */
  autoCollapse?: boolean
  /**
   * 当前展开态：提供时为受控模式（组件只 emit toggle 上报意向、展示完全随该 prop），
   * 缺省为非受控（组件内部维护；挂载即 streaming 的实例初始为展开）。
   */
  expanded?: boolean
}

/** Reasoning 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface ReasoningEmits {
  /**
   * 展开态变化（用户点击 / 流式自动展开 / 结束收起）时触发，payload 为切换后的展开态。
   * 受控模式下它是唯一的展开意向通道：组件不自行改状态，由使用方据此回写 expanded。
   * 挂载时由 streaming 初始值确定的初始展开态不派发本事件。
   */
  toggle: [expanded: boolean]
}

/** Reasoning 的 Slots。 */
export interface ReasoningSlots {
  /**
   * 头部文案：渲染进触发按钮内部、覆盖默认文案（「思考中…」/「已思考 x.xs」/「思考过程」），
   * 按钮语义（aria-expanded/aria-controls）与 chevron 指示仍由组件收口。
   */
  header?: (scope: ReasoningHeaderScope) => VNode[]
  /** 思考正文：覆盖 content prop 的默认文本渲染（可接入外部 Markdown 渲染器等）。 */
  content?: (scope: ReasoningContentScope) => VNode[]
}
