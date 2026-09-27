/**
 * accordion/ —— Accordion 的公共类型（Props / Emits / Slots / 条目模型）。
 * 与 Accordion.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 条目 key 类型：需在 items 内唯一。 */
export type AccordionItemKey = string | number

/** 单个折叠条目的数据模型。 */
export interface AccordionItem {
  /** 条目唯一标识（items 内必须唯一），同时作为展开 keys 集合中的值。 */
  key: AccordionItemKey
  /** 头部默认标题文本；title 插槽优先。 */
  title: string
  /** 面板默认正文文本；default 插槽优先。 */
  content?: string
  /** 禁用该条目：原生 disabled，移出 roving tabindex 焦点环，不可展开。 */
  disabled?: boolean
}

/** 单开模式（multiple=false）的展开值：当前展开条目的 key；全部收起为 null。 */
export type AccordionSingleValue = AccordionItemKey | null

/** 多开模式（multiple=true）的展开值：展开条目 keys 集合，按 items 顺序规范化。 */
export type AccordionMultipleValue = AccordionItemKey[]

/** modelValue 全集：单开为 key | null，多开为 keys 数组；不属于 items 的 key 不参与渲染。 */
export type AccordionModelValue = AccordionSingleValue | AccordionMultipleValue

/** change 事件载荷：被切换的条目、切换后的展开状态与切换后的完整展开值。 */
export interface AccordionChangeEvent {
  /** 被切换条目的 key。 */
  key: AccordionItemKey
  /** 切换后该条目是否展开。 */
  expanded: boolean
  /** 切换后的完整展开值（形态随 multiple 而定）。 */
  value: AccordionModelValue
}

/** 作用域插槽共享的作用域对象。 */
export interface AccordionItemScope {
  /** 当前条目数据。 */
  item: AccordionItem
  /** 条目在 items 中的下标。 */
  index: number
  /** 当前条目是否展开。 */
  expanded: boolean
}

/** Accordion 的 Props。 */
export interface AccordionProps {
  /** 条目数据源（必填）；key 需唯一。 */
  items: AccordionItem[]
  /** 当前展开值；提供时为受控模式（只 emit 不自行改状态），缺省为非受控。 */
  modelValue?: AccordionModelValue
  /** 多开模式：允许多个面板同时展开，展开值为 keys 数组；默认单开。 */
  multiple?: boolean
}

/** Accordion 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface AccordionEmits {
  /** 展开值变化：携带切换后的完整展开值（v-model 绑定用）。 */
  'update:modelValue': [value: AccordionModelValue]
  /** 条目展开状态被切换（含禁用外的每次成功切换）。 */
  change: [event: AccordionChangeEvent]
}

/** Accordion 的 Slots。 */
export interface AccordionSlots {
  /** 面板正文：按条目作用域定制；缺省渲染 item.content。 */
  default?: (scope: AccordionItemScope) => VNode[]
  /** 头部标题：按条目作用域定制；缺省渲染 item.title。 */
  title?: (scope: AccordionItemScope) => VNode[]
  /** 头部图标：按条目作用域定制；缺省渲染随展开状态翻转的内联 chevron。 */
  icon?: (scope: AccordionItemScope) => VNode[]
}
