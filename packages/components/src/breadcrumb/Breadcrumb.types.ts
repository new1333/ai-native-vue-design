/**
 * breadcrumb/ —— Breadcrumb 的公共类型（Props / Emits / Slots / 数据项与载荷）。
 * 与 Breadcrumb.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 单个面包屑项（数据源；渲染语义由 href / disabled 推导）。 */
export interface BreadcrumbItem {
  /** 唯一键（v-for :key）；缺省时回退 `ui-breadcrumb-item-<index>`。 */
  key?: string
  /** 展示文本，同时是默认渲染下的可读名（无 item 插槽时渲染为节点内容）。 */
  label: string
  /** 链接地址：有值渲染为原生 <a>（链接语义优先），无值渲染为 <button type="button">。 */
  href?: string
  /** 禁用该项：渲染为 aria-disabled 的 span，不可聚焦、不发出 itemClick。 */
  disabled?: boolean
}

/** item 插槽作用域（自定义项渲染时由使用方保证原生 a/button 交互语义）。 */
export interface BreadcrumbItemSlotScope {
  /** 当前项数据。 */
  item: BreadcrumbItem
  /** 在 items 源数组中的下标。 */
  index: number
  /** 是否为末项（当前页，aria-current="page" 落点）。 */
  isCurrent: boolean
}

/** itemClick 事件载荷。 */
export interface BreadcrumbItemClickPayload {
  /** 被点击的项。 */
  item: BreadcrumbItem
  /** 项在 items 源数组中的下标。 */
  index: number
  /** 原生 click 事件（<a> 项上先于浏览器导航发出，可在 handler 内 preventDefault 取消跳转）。 */
  event: MouseEvent
}

/** Breadcrumb 的 Props。 */
export interface BreadcrumbProps {
  /** 面包屑数据源（有序；末项视为当前页并标记 aria-current="page"）。 */
  items: BreadcrumbItem[]
  /**
   * 最大可见槽位数（含省略号占位）：items 超出时渲染为首项 + 省略号 + 末尾
   * (maxCount - 2) 项，末项（当前页）永远保留；小于 3 收敛为 3；缺省不折叠。
   */
  maxCount?: number
  /** 文本分隔符（如 '/'）；缺省渲染内联 chevron 图标，separator 插槽优先于本属性。 */
  separator?: string
}

/** Breadcrumb 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface BreadcrumbEmits {
  /**
   * 点击非 disabled 项时发出（原生 click 阶段）：<a> 项先于浏览器导航，
   * handler 内可对 payload.event.preventDefault() 取消跳转；<button> 项的
   * 键盘激活（Enter/Space）也经由同一 click 路径发出。
   */
  itemClick: [payload: BreadcrumbItemClickPayload]
}

/** Breadcrumb 的 Slots。 */
export interface BreadcrumbSlots {
  /** 自定义项渲染（作用域：item / index / isCurrent）；替代默认的 a/button/span 渲染。 */
  item?: (scope: BreadcrumbItemSlotScope) => VNode[]
  /** 自定义分隔符；缺省渲染内联 chevron 图标，提供 separator prop 时渲染其文本。 */
  separator?: () => VNode[]
}
