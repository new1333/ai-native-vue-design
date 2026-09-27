/**
 * scroll-area/ —— ScrollArea 的公共类型（Props / Emits / Slots / Expose）。
 * 与 ScrollArea.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/**
 * 装饰滚动条显隐档位：
 * - 'auto'：内容溢出时，悬停或滚动中可见，静止且未悬停时隐藏（默认档）；
 * - 'always'：内容溢出期间恒定可见；
 * - 'hover'：内容溢出且指针悬停于区域内时可见；
 * - 'scroll'：内容溢出且正在滚动时可见，静默 SCROLL_AREA_HIDE_DELAY_MS 后隐藏。
 */
export type ScrollAreaType = 'auto' | 'always' | 'hover' | 'scroll'

/**
 * 可滚动方向：
 * - 'vertical'：仅纵向滚动（横向溢出被裁剪且不渲染横向条，默认档）；
 * - 'horizontal'：仅横向滚动（纵向溢出被裁剪且不渲染纵向条）；
 * - 'both'：两个方向均可滚动、均渲染装饰条。
 */
export type ScrollAreaDirection = 'vertical' | 'horizontal' | 'both'

/** ScrollArea 的 Props。 */
export interface ScrollAreaProps {
  /** 装饰滚动条显隐档位，默认 'auto'（悬停或滚动中可见）。 */
  type?: ScrollAreaType

  /** 可滚动方向，默认 'vertical'（仅纵向）；被排除方向的溢出内容被裁剪且不渲染对应装饰条。 */
  direction?: ScrollAreaDirection
}

/** ScrollArea 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface ScrollAreaEmits {
  /** viewport 原生 scroll 事件转发：载荷为原生 Event（经 event.currentTarget 读取 scrollTop/scrollLeft）。 */
  scroll: [event: Event]
}

/** ScrollArea 的 Slots。 */
export interface ScrollAreaSlots {
  /** 滚动内容：任意内容，常驻 DOM（不做虚拟化）。 */
  default?: () => VNode[]
}

/** ScrollArea 的 Expose。 */
export interface ScrollAreaExpose {
  /**
   * 手动重测：ResizeObserver 以 viewport 与内容包裹层的尺寸变化驱动重测，
   * 无法覆盖的内容变化（如横向内容在挂载后变宽）可调用该方法立即刷新装饰条几何。
   */
  update: () => void
}
