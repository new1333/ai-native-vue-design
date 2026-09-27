/**
 * layout/ —— 逻辑常量收口（断点像素、默认值；不是视觉值，视觉只走 --ui-* token）。
 */
import type { LayoutBreakpoint } from './Layout.types'

/**
 * 断点像素全集（与 Layout.types.ts 的 LayoutBreakpoint 一一对应）。
 * 数值为行为常量（matchMedia 查询入参），不是 CSS 视觉值；
 * 如需 token 化可在 tokens 包增设 --ui-breakpoint-*（需求在任务结果中提出）。
 */
export const LAYOUT_BREAKPOINTS: Readonly<Record<LayoutBreakpoint, number>> = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1600,
}

/** 断点档位全集（与 LAYOUT_BREAKPOINTS 的键序一致，自窄到宽）。 */
export const LAYOUT_BREAKPOINT_ORDER: readonly LayoutBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl']

/** LayoutSider 非受控初始折叠态默认值。 */
export const LAYOUT_SIDER_DEFAULT_COLLAPSED = false

/**
 * 断点 → matchMedia 查询串：宽度「低于该档」视为命中（如 md → max-width: 991px）。
 * 纯函数、无浏览器 API 依赖，SSR 期可安全调用。
 */
export function breakpointQuery(breakpoint: LayoutBreakpoint): string {
  return `(max-width: ${LAYOUT_BREAKPOINTS[breakpoint] - 1}px)`
}
