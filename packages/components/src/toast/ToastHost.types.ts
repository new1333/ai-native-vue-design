/**
 * toast/ —— ToastHost 与 toast 单例的公共类型（Props / 程序式 API 面）。
 * 与 ToastHost.meta.ts 的 api 字段保持一致。
 */

/** 提示变体。 */
export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

/** 提示 id：toast.success/error/info/warning 的返回值，供 toast.remove 使用。 */
export type ToastId = number

/** 程序式调用选项（toast.success(message, options) 等）。 */
export interface ToastOptions {
  /**
   * 自动关闭时长（毫秒），默认 TOAST_DURATION_DEFAULT(4000)。
   * 传 0 表示不自动关闭，只能经关闭按钮或 toast.remove(id) 移除。
   * 展示时长是行为语义常量而非视觉动效（转场动效一律走 --ui-motion-* token）。
   */
  duration?: number
  /**
   * 关闭回调：无论超时、点击关闭按钮还是 toast.remove(id)，
   * 每条提示恰好触发一次。
   */
  onClose?: () => void
}

/** 栈内一条提示（ToastHost 的渲染数据；由 toast 单例创建，字段不可变）。 */
export interface ToastItem {
  /** 唯一 id（自增发号）。 */
  id: ToastId
  /** 提示文本。 */
  message: string
  /** 变体。 */
  variant: ToastVariant
  /** 已解析的自动关闭时长（毫秒）；≤0 表示不自动关闭。 */
  duration: number
  /** 关闭回调（恰好触发一次）。 */
  onClose?: () => void
}

/** toast 单例的程序式 API 面（默认导出与命名导出同为该类型）。 */
export interface ToastApi {
  /** 推入成功提示，返回 id。 */
  success: (message: string, options?: ToastOptions) => ToastId
  /** 推入错误提示（role=alert），返回 id。 */
  error: (message: string, options?: ToastOptions) => ToastId
  /** 推入中性信息提示，返回 id。 */
  info: (message: string, options?: ToastOptions) => ToastId
  /** 推入警告提示，返回 id。 */
  warning: (message: string, options?: ToastOptions) => ToastId
  /** 按 id 移除一条提示；命中返回 true 并触发其 onClose，未命中返回 false。 */
  remove: (id: ToastId) => boolean
}

/** ToastHost 的 Props（无 props：位置/层级/文案均为固定契约，见 meta）。 */
export interface ToastHostProps {}

/** ToastItem（目录内部渲染单元，不从 index.ts 公共导出）的 Props。 */
export interface ToastItemProps {
  /** 该条提示的渲染数据。 */
  item: ToastItem
}
