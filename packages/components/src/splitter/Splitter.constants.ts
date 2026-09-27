/**
 * splitter/ —— 逻辑常量收口（方向全集、键名、步长与吸附阈值等；
 * 不是视觉值，视觉只走 --ui-* token）。
 */
import type { SplitterDirection } from './Splitter.types'

/** direction 全集（与 Splitter.types.ts 的 SplitterDirection 一一对应）。 */
export const SPLITTER_DIRECTIONS = ['horizontal', 'vertical'] as const satisfies readonly SplitterDirection[]

/** 默认分割方向：左右分栏。 */
export const SPLITTER_DIRECTION_DEFAULT = 'horizontal' as const

/** 面板最小尺寸缺省值（百分比）。 */
export const SPLITTER_MIN_DEFAULT = 0

/** 面板最大尺寸缺省值（百分比）。 */
export const SPLITTER_MAX_DEFAULT = 100

/** 面板是否可折叠的缺省值。 */
export const SPLITTER_COLLAPSIBLE_DEFAULT = false

/** 分隔条 aria-label 缺省文案（可用 panes[i].label / SplitterPane label 覆盖）。 */
export const SPLITTER_HANDLE_LABEL_DEFAULT = '调整面板尺寸'

/**
 * 键盘方向键（WAI-ARIA window splitter）：
 * direction="horizontal" 的分隔条为竖线（aria-orientation="vertical"），用 ←/→；
 * direction="vertical" 的分隔条为横线（aria-orientation="horizontal"），用 ↑/↓。
 * decrease = 分隔条向前移动（主/前面板减小），increase = 向后移动（主面板增大）。
 */
export const SPLITTER_KEYS_HORIZONTAL = { decrease: 'ArrowLeft', increase: 'ArrowRight' } as const
export const SPLITTER_KEYS_VERTICAL = { decrease: 'ArrowUp', increase: 'ArrowDown' } as const

/** Enter：折叠 / 恢复主面板（APG window splitter 的 Enter 路径）。 */
export const SPLITTER_COLLAPSE_KEY = 'Enter'

/** Home / End：主面板调到最小 / 最大允许尺寸。 */
export const SPLITTER_HOME_KEY = 'Home'
export const SPLITTER_END_KEY = 'End'

/** 键盘单步调整量（百分比）。 */
export const SPLITTER_STEP_PERCENT = 1

/** 拖拽折叠吸附阈值系数：吸附线 = min × 该系数（仅对可折叠面板生效）。 */
export const SPLITTER_COLLAPSE_SNAP_FACTOR = 0.5

/** min 为 0 的可折叠面板的拖拽折叠吸附阈值（百分比）。 */
export const SPLITTER_SNAP_THRESHOLD_PERCENT = 1

/** 百分比比较 / 判定折叠（尺寸为 0）的误差。 */
export const SPLITTER_SIZE_EPSILON = 1e-3

/** 渲染 flex-basis 时保留的小数位（避免无限小数撑长标记）。 */
export const SPLITTER_PERCENT_PRECISION = 4
