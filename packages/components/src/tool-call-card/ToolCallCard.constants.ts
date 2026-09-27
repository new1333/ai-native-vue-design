/**
 * tool-call-card/ —— 逻辑常量收口（状态全集、档位映射、内置文案；不是视觉值，视觉只走 --ui-* token）。
 */
import type { ToolCallStatus } from './ToolCallCard.types'

/** 工具调用状态全集（与 ToolCallCard.types.ts 的 ToolCallStatus 一一对应）。 */
export const TOOL_CALL_STATUSES = [
  'queued',
  'running',
  'completed',
  'failed',
  'waitingApproval',
] as const satisfies readonly ToolCallStatus[]

/** 默认状态：调用刚入队尚未执行。 */
export const TOOL_CALL_STATUS_DEFAULT = 'queued' as const

/**
 * 状态 → 徽标档位：复用 Badge 的 variant 词表（neutral/info/success/danger/warning），
 * 状态徽标以同系 soft 底 + 同系文字色表达（Badge 语义，见 Badge.vue）。
 */
export const TOOL_CALL_STATUS_BADGE_VARIANT: Record<
  ToolCallStatus,
  'neutral' | 'info' | 'success' | 'danger' | 'warning'
> = {
  queued: 'neutral',
  running: 'info',
  completed: 'success',
  failed: 'danger',
  waitingApproval: 'warning',
}

/** 状态 → 根元素修饰类用的 kebab 词（waitingApproval → waiting-approval）。 */
export const TOOL_CALL_STATUS_CLASS: Record<ToolCallStatus, string> = {
  queued: 'queued',
  running: 'running',
  completed: 'completed',
  failed: 'failed',
  waitingApproval: 'waiting-approval',
}

/** 状态 → 内置中文标签（读屏与视觉同源；#header 插槽可整体接管）。 */
export const TOOL_CALL_STATUS_LABELS: Record<ToolCallStatus, string> = {
  queued: '排队中',
  running: '运行中',
  completed: '已完成',
  failed: '失败',
  waitingApproval: '待审批',
}

/** 入参区可见标签。 */
export const TOOL_CALL_ARGS_LABEL = '入参'

/** 结果区可见标签。 */
export const TOOL_CALL_RESULT_LABEL = '结果'

/** 审批按钮内置文案：批准。 */
export const TOOL_CALL_APPROVE_LABEL = '批准'

/** 审批按钮内置文案：拒绝。 */
export const TOOL_CALL_REJECT_LABEL = '拒绝'

/** 审批操作组的可访问名。 */
export const TOOL_CALL_APPROVAL_LABEL = '人工审批'
