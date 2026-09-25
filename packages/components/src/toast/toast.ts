/**
 * toast —— 程序式全局通知单例（本模块默认导出，同时提供同名命名导出）。
 *
 * - toast.success/error/info/warning(message, { duration?, onClose? }) 推入一条提示，
 *   返回自增 id；toast.remove(id) 按 id 移除。
 * - 栈是模块级单例状态（ref）；由 <ToastHost />（应用挂载一次）Teleport 到 body 堆叠渲染。
 *   未挂载 Host 时推入不报错，提示会保留到 Host 挂载后渲染（但不会自动关闭——
 *   自动关闭计时器位于渲染单元内）。
 * - SSR 安全：模块顶层只用 Vue ref，不访问任何浏览器 API；node 环境可直接调用。
 */
import { ref } from 'vue'
import { TOAST_DURATION_DEFAULT } from './ToastHost.constants'
import type { ToastApi, ToastId, ToastItem, ToastOptions, ToastVariant } from './ToastHost.types'

/**
 * 当前提示栈（模块级单例状态）。
 * 仅目录内 ToastHost 消费与测试清理使用，不从 index.ts 公共导出。
 */
export const toasts = ref<ToastItem[]>([])

/** 自增 id 发号器（模块级，保证单例生命周期内唯一）。 */
let nextId: ToastId = 1

/** 推入一条提示（追加到栈尾，堆叠自上而下按推入顺序渲染）。 */
function push(variant: ToastVariant, message: string, options?: ToastOptions): ToastId {
  const id = nextId
  nextId += 1
  toasts.value = [
    ...toasts.value,
    {
      id,
      message,
      variant,
      duration: options?.duration ?? TOAST_DURATION_DEFAULT,
      onClose: options?.onClose,
    },
  ]
  return id
}

/**
 * 按 id 移除一条提示：命中则出栈并触发其 onClose（恰好一次），返回 true；
 * 未命中（已关闭/不存在）返回 false，不触发任何回调。
 */
function remove(id: ToastId): boolean {
  const target = toasts.value.find(item => item.id === id)
  if (!target) return false
  toasts.value = toasts.value.filter(item => item.id !== id)
  target.onClose?.()
  return true
}

/** toast 单例：全部程序式入口。 */
const toast: ToastApi = {
  success: (message, options) => push('success', message, options),
  error: (message, options) => push('error', message, options),
  info: (message, options) => push('info', message, options),
  warning: (message, options) => push('warning', message, options),
  remove,
}

export default toast
export { toast }
