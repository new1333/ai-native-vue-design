/**
 * suggestion/ —— Suggestion 的公共类型（Props / Emits / Slots / 条目模型）。
 * 与 Suggestion.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 单条建议项的数据模型：label 为 chip 展示文案，value 为回填输入框的载荷。 */
export interface SuggestionItem {
  /** chip 上的可读展示文案。 */
  label: string
  /** 回填载荷：选中后由使用方写入输入框（PromptInput）的提示词文本；items 内建议唯一（用作 key）。 */
  value: string
  /** 禁用该条：原生 disabled，移出 Tab 序，点击与键盘激活均不上抛 select。 */
  disabled?: boolean
}

/** item 作用域插槽共享的作用域对象。 */
export interface SuggestionItemScope {
  /** 当前建议项。 */
  item: SuggestionItem
  /** 建议项在 items 中的下标。 */
  index: number
}

/** Suggestion 的 Props。 */
export interface SuggestionProps {
  /** 建议项数据源（必填）；value 需唯一，同时用作 chip 的 key 与回填载荷。 */
  items: SuggestionItem[]
  /** 禁用整组：全部 chips 原生 disabled（移出 Tab 序），一切选中路径被拦截。 */
  disabled?: boolean
  /** 加载中（建议生成期间）：拦截一切选中路径并置根级 aria-busy="true"，chips 保持可聚焦、不置原生 disabled。 */
  loading?: boolean
}

/** Suggestion 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface SuggestionEmits {
  /** 选中一条建议：载荷为被点击的建议项；由使用方将 item.value 回填输入框。 */
  select: [item: SuggestionItem]
}

/** Suggestion 的 Slots。 */
export interface SuggestionSlots {
  /** 前置内容：渲染在 chips 之前的标题/说明（如「推荐追问」标签）。 */
  default?: () => VNode[]
  /** 单个 chip 内容：按条目作用域定制；缺省渲染 item.label。 */
  item?: (scope: SuggestionItemScope) => VNode[]
}
