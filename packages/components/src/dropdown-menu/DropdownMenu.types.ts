/**
 * dropdown-menu/ —— DropdownMenu 的公共类型（Props / Emits / Slots）。
 * 与 DropdownMenu.meta.ts 的 api 字段保持一致。
 */
import type { Component, VNode } from 'vue'

/** 菜单面板与触发器的水平对齐。 */
export type DropdownMenuAlign = 'start' | 'end'

/** 菜单项数据。 */
export interface DropdownMenuItem {
  /** 稳定标识；select 事件的载荷。 */
  key: string
  /** 菜单项文本。 */
  label: string
  /** 左侧图标组件（内联 SVG 组件：viewBox 0 0 24 24、stroke-width 1.5、currentColor；组件统一约束为 16px）。 */
  icon?: Component
  /** 危险项：以 danger 色呈现。 */
  danger?: boolean
  /** 禁用项：原生 disabled（不可聚焦、不可选），roving focus 跳过。 */
  disabled?: boolean
}

/** DropdownMenu 的 Props。 */
export interface DropdownMenuProps {
  /** 菜单项数据（按序渲染为 menuitem）。 */
  items: DropdownMenuItem[]
  /** 菜单相对触发器的水平对齐，默认 'start'。 */
  align?: DropdownMenuAlign
}

/** DropdownMenu 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface DropdownMenuEmits {
  /** 选中菜单项（点击或菜单内 Enter；disabled 项不触发），载荷为该项 key。 */
  select: [key: string]
}

/** DropdownMenu 的 Slots。 */
export interface DropdownMenuSlots {
  /**
   * 触发器：插槽为「单个元素/组件 vnode」时该元素直接作为触发元素——组件合并
   * id、aria-haspopup、aria-expanded、aria-controls 与 click/keydown 监听，
   * 不再包裹内建 button（元素须可聚焦，如 Button / 原生 button）；
   * 文本/多根/空插槽回退为内建原生 button 触发器。应始终有可读 label。
   */
  default?: () => VNode[]
  /** items 为空时的空态内容；缺省渲染默认空态文案（暂无选项）。仅在面板打开时渲染。 */
  empty?: () => VNode[]
}

/** DropdownMenu 对外暴露的实例方法。 */
export interface DropdownMenuExpose {
  /** 聚焦触发器按钮（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除触发器焦点。 */
  blur: () => void
}
