/**
 * message/ —— 逻辑常量收口（角色/状态档位全集、默认值、内置文案；不是视觉值，
 * 视觉只走 --ui-* token）。
 */
import type { MessageRole, MessageStatus } from './Message.types'

/** 角色档位全集（与 Message.types.ts 的 MessageRole 一一对应）。 */
export const MESSAGE_ROLES = ['user', 'assistant', 'system'] as const satisfies readonly MessageRole[]

/** 默认角色：assistant（AI 会话主体；其消息承载 streaming/status 等生成侧状态）。 */
export const MESSAGE_ROLE_DEFAULT = 'assistant' as const

/** 状态档位全集（与 Message.types.ts 的 MessageStatus 一一对应）。 */
export const MESSAGE_STATUSES = ['sending', 'sent', 'error'] as const satisfies readonly MessageStatus[]

/**
 * 各角色的称谓兜底：name 未提供时用作头像回退首字母的推导来源与
 * 头像可读名称（role="img" 的 aria-label / <img> alt）。
 */
export const MESSAGE_ROLE_LABEL: Record<MessageRole, string> = {
  user: '用户',
  assistant: '助手',
  system: '系统',
}

/** status 状态徽标内置文案（status 未传时不渲染徽标；需自定义状态表达走 #actions 或内容侧）。 */
export const MESSAGE_STATUS_TEXT: Record<MessageStatus, string> = {
  sending: '发送中',
  sent: '已发送',
  error: '发送失败',
}
