/**
 * agent-status/ —— AgentStatus 的公共类型（Props / Slots）。
 * 与 AgentStatus.meta.ts 的 api 字段保持一致。
 *
 * status 枚举对齐设计文档 §14「AI-native 的重点是 state semantics」的
 * agent 生命周期状态全集（设计稿 kebab 形式，API 面取 camelCase）：
 * queued / running / streaming / waiting-for-tool / tool-running / completed / failed / cancelled
 */
import type { VNode } from 'vue'

/** agent 生命周期状态语义档位（§14 state semantics 全集）。 */
export type AgentStatusState =
  | 'queued'
  | 'running'
  | 'streaming'
  | 'waitingForTool'
  | 'toolRunning'
  | 'completed'
  | 'failed'
  | 'cancelled'

/** AgentStatus 的 Props。 */
export interface AgentStatusProps {
  /** 生命周期状态档位，默认 'queued'。 */
  status?: AgentStatusState
  /**
   * 状态文本：缺省时取各状态的默认文案（AGENT_STATUS_LABELS）。
   * 文本渲染在 role="status" live region 内，状态变化即被读屏播报——
   * 状态语义必须由文本承载，不要只靠图形/颜色。
   */
  label?: string
  /** 补充说明（第二行，弱化呈现）：如"正在执行 3/7 步"“等待 get_weather 返回"。可选。 */
  detail?: string
}

/** AgentStatus 的 Slots。 */
export interface AgentStatusSlots {
  /**
   * 前置状态图形：覆盖默认指示器（运行态 Spinner / 其余状态小圆点）。
   * 容器整体 aria-hidden（纯装饰），状态语义始终由文本承载。
   */
  icon?: () => VNode[]
  /** 状态文本：覆盖 label / 默认文案（仍在 role="status" live region 内）。 */
  default?: () => VNode[]
}
