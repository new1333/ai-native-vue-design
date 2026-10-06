/**
 * useCountdown —— Statistic 的数值/倒计时逻辑收口（headless 纯函数 + 计时 composable）。
 *
 * 收口两件事，保持 SFC 薄（usePagination 同策略）：
 *   1. 纯函数 formatStatisticValue / formatCountdown / clampCountdownSeconds：
 *      数值 precision 格式化与倒计时 mm:ss / HH:mm:ss 文本，可在 SSR 与
 *      单元测试中独立调用，不依赖任何浏览器 API；
 *   2. useCountdown：墙钟差值递减剩余秒数——起表时记 deadline =
 *      Date.now() + remaining，每拍以 deadline - Date.now() 重算（向下取整
 *      并钳到 0），后台标签页 setInterval 被节流（≥1s 甚至 1/min）时进度
 *      仍与墙钟一致；≤0 走既有 finish 路径（停表 + 每轮恰一次回调）；
 *      restart() 供挂载起表与 value 变更（受控重置）共用同一条路径
 *      （停表保留 remaining，起表重算 deadline）。
 *
 * SSR 安全：只使用 setInterval/clearInterval（node 与浏览器同构，useToastTimer
 * 同策略），且仅由客户端生命周期（onMounted / onBeforeUnmount）与客户端响应式
 * 回调（props 变更）调用；SSR 渲染期间不起表、不触碰计时器。
 */
import { ref } from 'vue'
import type { Ref } from 'vue'
import { STATISTIC_COUNTDOWN_TICK_MS } from './Statistic.constants'

/** 把任意秒数收敛为 ≥0 整数（非有限数回退 0）。 */
export function clampCountdownSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0
  return Math.max(0, Math.floor(seconds))
}

/**
 * 数值格式化：toFixed(precision)。
 * 非有限数值回退 0；precision 收敛为 [0,100] 整数（负数按 0、非有限数按 0，
 * 上界 100 亦是 toFixed 的合法上限，超出会 RangeError）。
 */
export function formatStatisticValue(value: number, precision: number): string {
  const safeValue = Number.isFinite(value) ? value : 0
  const safePrecision = Number.isFinite(precision)
    ? Math.min(100, Math.max(0, Math.trunc(precision)))
    : 0
  return safeValue.toFixed(safePrecision)
}

/** 两位补零。 */
function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** 倒计时文本（入参收敛为 ≥0 整数秒）：<1 小时为 mm:ss，≥1 小时为 HH:mm:ss。 */
export function formatCountdown(seconds: number): string {
  const total = clampCountdownSeconds(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const mmss = `${pad2(minutes)}:${pad2(secs)}`
  return hours > 0 ? `${pad2(hours)}:${mmss}` : mmss
}

/** useCountdown 选项（getter 入参，保持 headless 可测）。 */
export interface UseCountdownOptions {
  /** 是否处于倒计时模式：非倒计时不起表（重置 remaining 后保持停表）。 */
  active: () => boolean
  /** 初始/受控剩余秒数（每次 restart 重读）。 */
  totalSeconds: () => number
  /** 递减触达 0 时回调（每轮恰一次；初始即 0 不回调）。 */
  onFinish: () => void
}

/** useCountdown 返回值。 */
export interface UseCountdownReturn {
  /** 当前剩余秒数（≥0 整数，响应式）。 */
  remaining: Ref<number>
  /** 以 totalSeconds() 重置剩余并按需起/停表（挂载起表与 value 受控重置共用）。 */
  restart: () => void
  /** 停表清理（onBeforeUnmount 调用，幂等）。 */
  dispose: () => void
}

/** Statistic 倒计时计时器：墙钟差值递减（抗后台节流），归零自停。 */
export function useCountdown(options: UseCountdownOptions): UseCountdownReturn {
  const remaining = ref(clampCountdownSeconds(options.totalSeconds()))
  let timer: ReturnType<typeof setInterval> | null = null
  /** 墙钟截止时刻（ms）：进度由 deadline 与 Date.now() 的差值决定，与 interval 拍数解耦。 */
  let deadline = 0

  function stop(): void {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function tick(): void {
    // 墙钟差值：后台标签页 interval 被节流（每拍间隔被拉长）时，单拍也按
    // 真实经过时间收敛，倒计时不会因拍数少而变慢；向下取整并钳到 0。
    remaining.value = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
    if (remaining.value === 0) {
      stop()
      options.onFinish()
    }
  }

  function restart(): void {
    stop()
    remaining.value = clampCountdownSeconds(options.totalSeconds())
    if (options.active() && remaining.value > 0) {
      deadline = Date.now() + remaining.value * 1000
      timer = setInterval(tick, STATISTIC_COUNTDOWN_TICK_MS)
    }
  }

  return { remaining, restart, dispose: stop }
}
