/**
 * agent-status/ —— 逻辑常量收口（状态全集、运行态子集、默认文案）。
 * 不是视觉值；视觉只走 --ui-* token（paper.css）。
 */
import type { AgentStatusState } from './AgentStatus.types'

/** 状态语义档位全集（与 AgentStatus.types.ts 的 AgentStatusState 一一对应）。 */
export const AGENT_STATUS_STATES = [
  'queued',
  'running',
  'streaming',
  'waitingForTool',
  'toolRunning',
  'completed',
  'failed',
  'cancelled',
] as const satisfies readonly AgentStatusState[]

/** 默认状态档位：生命周期起点。 */
export const AGENT_STATUS_DEFAULT = 'queued' as const

/**
 * 运行态子集：这些状态表达"正在工作"，前置指示器组合 Spinner；
 * 其余状态（排队/等待工具/终态）用静态小圆点。
 */
export const AGENT_STATUS_ACTIVE_STATES: readonly AgentStatusState[] = [
  'running',
  'streaming',
  'toolRunning',
]

/** 各状态的默认文案（label 缺省时使用；状态语义由文本承载）。 */
export const AGENT_STATUS_LABELS: Record<AgentStatusState, string> = {
  queued: '排队中',
  running: '运行中',
  streaming: '流式输出中',
  waitingForTool: '等待工具',
  toolRunning: '工具执行中',
  completed: '已完成',
  failed: '已失败',
  cancelled: '已取消',
}
