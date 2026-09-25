/**
 * useToastTimer —— 单条提示的自动关闭计时 composable：倒计时 + hover 暂停/恢复。
 *
 * - start()：以 duration 起表（duration ≤ 0 视为不自动关闭，no-op）。
 * - pause()（mouseenter）：冻结并记录剩余时长；resume()（mouseleave）按剩余时长续表。
 * - cancel()：永久取消（条目关闭/卸载时清理，幂等）。
 *
 * SSR 安全：只使用 setTimeout/clearTimeout/Date.now（node 与浏览器同构），
 * 且仅由客户端生命周期（ToastItem 的 onMounted/onBeforeUnmount）与用户事件调用。
 */
export interface UseToastTimerOptions {
  /** 自动关闭时长（毫秒）；≤0 表示不自动关闭。 */
  duration: number
  /** 倒计时归零回调（超时关闭路径）。 */
  onExpire: () => void
}

/** useToastTimer 返回值。 */
export interface UseToastTimerReturn {
  /** 起表：重置为完整 duration 开始倒计时（duration ≤ 0 时 no-op）。 */
  start: () => void
  /** 暂停：冻结倒计时并记录剩余时长（未在计时/已取消时 no-op，幂等）。 */
  pause: () => void
  /** 恢复：按剩余时长续表（未暂停、剩余 ≤0 或不自动关闭时 no-op，幂等）。 */
  resume: () => void
  /** 取消：永久停止计时（关闭/卸载清理用，幂等）。 */
  cancel: () => void
}

/** 单条提示的自动关闭计时器（剩余时长跟踪 + 暂停/恢复）。 */
export function useToastTimer(options: UseToastTimerOptions): UseToastTimerReturn {
  let handle: ReturnType<typeof setTimeout> | null = null
  let remaining = options.duration
  let startedAt = 0

  function clear(): void {
    if (handle === null) return
    clearTimeout(handle)
    handle = null
  }

  /** 以当前剩余时长（重新）挂表。 */
  function arm(): void {
    clear()
    startedAt = Date.now()
    handle = setTimeout(() => {
      handle = null
      options.onExpire()
    }, remaining)
  }

  function start(): void {
    if (options.duration <= 0) return
    remaining = options.duration
    arm()
  }

  function pause(): void {
    if (handle === null) return
    remaining = Math.max(0, remaining - (Date.now() - startedAt))
    clear()
  }

  function resume(): void {
    if (handle !== null || options.duration <= 0 || remaining <= 0) return
    arm()
  }

  function cancel(): void {
    clear()
    remaining = 0
  }

  return { start, pause, resume, cancel }
}
