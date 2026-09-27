/**
 * message/ —— Message 的公共类型（Props / Slots）。
 * 与 Message.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 会话角色：user 右对齐、assistant 左对齐（会话主体）、system 居中弱化（系统通知）。 */
export type MessageRole = 'user' | 'assistant' | 'system'

/** 消息状态徽标：sending 发送中 / sent 已发送 / error 发送失败。不传则不渲染徽标。 */
export type MessageStatus = 'sending' | 'sent' | 'error'

/** Message 的 Props。 */
export interface MessageProps {
  /** 会话角色，默认 'assistant'：决定对齐方向与气泡配皮（user 右/accent-soft、assistant 左/surface+描边、system 居中无气泡）。 */
  role?: MessageRole
  /** 发送者显示名称：渲染于 meta 行；同时作为头像回退首字母的推导来源。 */
  name?: string
  /** 头像图片地址：传入即渲染内置 Avatar（加载失败回退首字母）；user/assistant 缺省时回退角色首字母头像，system 缺省不渲染头像列。 */
  avatar?: string
  /** 时间戳文案：由使用方格式化后传入的字符串，meta 行内以 tabular-nums 弱化展示。 */
  timestamp?: string
  /** 流式生成中：气泡内容尾部渲染流式光标（纯 CSS、aria-hidden），根元素置 aria-busy="true"。 */
  streaming?: boolean
  /** 消息状态徽标：meta 行内渲染内置文案与图标；'error' 额外把气泡描边染为 danger 色。 */
  status?: MessageStatus
}

/**
 * 插槽作用域：当前消息的完整上下文汇总。
 * 三个插槽（default / avatar / actions）以同名 `message` 字段暴露同一份上下文。
 */
export interface MessageContext {
  role: MessageRole
  name: string | undefined
  avatar: string | undefined
  timestamp: string | undefined
  streaming: boolean
  status: MessageStatus | undefined
}

/** Message 的 Slots（作用域统一为 `{ message: MessageContext }`）。 */
export interface MessageSlots {
  /**
   * 消息正文：气泡内容（纯文本、Markdown 渲染结果等由使用方决定）。
   * 流式光标渲染于插槽内容之后、同一内容容器内。
   */
  default?: (scope: { message: MessageContext }) => VNode[]
  /** 头像：覆盖内置 Avatar（任意角色生效；system 角色的内建回退头像本就不渲染，此插槽是 system 出现头像的唯一方式）。 */
  avatar?: (scope: { message: MessageContext }) => VNode[]
  /** 操作区：渲染于气泡之下（重试 / 复制 / 反馈等使用方控件），未提供时不渲染该区。 */
  actions?: (scope: { message: MessageContext }) => VNode[]
}
