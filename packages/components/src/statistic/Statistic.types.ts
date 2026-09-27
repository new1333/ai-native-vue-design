/**
 * statistic/ —— Statistic 的公共类型（Props / Emits / Slots）。
 * 与 Statistic.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 趋势方向档位：up 上升（success 色）/ down 下降（danger 色）。 */
export type StatisticTrend = 'up' | 'down'

/** Statistic 的 Props。 */
export interface StatisticProps {
  /**
   * 统计值：toFixed(precision) 格式化（非有限数回退 0）；
   * countdown=true 时语义为初始剩余秒数，变更即重置倒计时。
   */
  value?: number
  /** 小数位数（收敛为 [0,100] 整数，负数按 0）；countdown 模式忽略（秒数为整数）。 */
  precision?: number
  /** 数值前缀文本（如货币符号）；#prefix 插槽优先。 */
  prefix?: string
  /** 数值后缀文本（如单位）；#suffix 插槽优先。 */
  suffix?: string
  /** 标题文本；#title 插槽优先。 */
  title?: string
  /** 趋势方向：渲染带可访问名的方向箭头（up=success / down=danger）。 */
  trend?: StatisticTrend
  /**
   * 倒计时模式：value 为初始剩余秒数，客户端每秒递减至 0 停表并发出 finish
   * （初始即 0 不发出）；precision 忽略，展示 <1h 为 mm:ss、≥1h 为 HH:mm:ss。
   */
  countdown?: boolean
}

/** Statistic 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface StatisticEmits {
  /** 倒计时递减触达 0 时发出一次（仅 countdown 模式；初始即 0 不发出）。 */
  finish: []
}

/**
 * Statistic 的 Slots（全部可选：内容由 props 驱动，插槽按需覆盖默认渲染）。
 */
export interface StatisticSlots {
  /** 标题：覆盖 title 文本的默认渲染。 */
  title?: () => VNode[]
  /** 前缀：覆盖 prefix 文本的默认渲染。 */
  prefix?: () => VNode[]
  /** 后缀：覆盖 suffix 文本的默认渲染。 */
  suffix?: () => VNode[]
  /** 数值：覆盖格式化数值 / 倒计时文本的默认渲染（如千分位等自定义格式）。 */
  default?: () => VNode[]
}
