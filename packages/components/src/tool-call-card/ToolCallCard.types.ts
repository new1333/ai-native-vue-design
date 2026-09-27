/**
 * tool-call-card/ —— ToolCallCard 的公共类型（Props / Emits / Slots）。
 * 与 ToolCallCard.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/**
 * 工具调用状态（设计文档 §14 state semantics：表达真实状态而非视觉特效；
 * 枚举取任务契约的五态，waitingApproval 即 §14.3 ToolCall 的人工审批态）。
 */
export type ToolCallStatus = 'queued' | 'running' | 'completed' | 'failed' | 'waitingApproval'

/** ToolCallCard 的 Props。 */
export interface ToolCallCardProps {
  /** 工具名：头部主标题（如 'web_search'、'run_sql'）。 */
  name: string
  /** 入参：字符串原样展示，其余值 JSON 序列化（两空格缩进）展示；不传不渲染入参区。 */
  args?: unknown
  /** 结果：展示规则同 args；status="failed" 时结果区以 danger 语义色表达错误输出；不传不渲染结果区。 */
  result?: unknown
  /** 工具调用状态，默认 'queued'。受控 prop：状态流转由使用方驱动，组件不自行变更。 */
  status?: ToolCallStatus
  /** 执行时长（毫秒）：不传或 null 不展示；<1000 显示「Nms」，否则显示一位小数秒。 */
  duration?: number | null
  /** 禁用审批操作：仅在 status="waitingApproval" 下有可见效果（原生 disabled 置灰批准/拒绝按钮）。 */
  disabled?: boolean
}

/** ToolCallCard 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface ToolCallCardEmits {
  /** 点击「批准」按钮：仅 status="waitingApproval" 时按钮存在；审批后续状态流转由使用方驱动。 */
  approve: []
  /** 点击「拒绝」按钮：仅 status="waitingApproval" 时按钮存在。 */
  reject: []
}

/** ToolCallCard 的 Slots。 */
export interface ToolCallCardSlots {
  /**
   * 接管整个头部行（内置「工具名 + 时长 + 状态徽标」不渲染）。
   * 注意：接管后内置的状态 live region 一并移除，状态播报由接管方自行承担。
   * 作用域：name = 工具名；status = 当前状态；duration = 时长毫秒数（未传为 null）。
   */
  header?: (scope: { name: string; status: ToolCallStatus; duration: number | null }) => VNode[]
  /**
   * 覆盖入参区内容（区块标签「入参」仍由组件渲染）。
   * 作用域：args = 原始入参；formatted = 内置序列化文本。
   */
  args?: (scope: { args: unknown; formatted: string }) => VNode[]
  /**
   * 覆盖结果区内容（区块标签「结果」仍由组件渲染）。
   * 作用域：result = 原始结果；formatted = 内置序列化文本；status = 当前状态。
   */
  result?: (scope: { result: unknown; formatted: string; status: ToolCallStatus }) => VNode[]
  /** 底部附加区：承载额外操作（重试、查看原始输出等），渲染于审批区之后。作用域：status。 */
  footer?: (scope: { status: ToolCallStatus }) => VNode[]
}
