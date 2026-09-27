/**
 * autocomplete/ —— AutoComplete 的公共类型（Props / Emits / Slots / Expose）。
 * 与 AutoComplete.meta.ts 的 api 字段保持一致。
 *
 * 值模型：modelValue 即输入框文本（「值+文本」合一，string 受控）——
 * 选中建议后文本同步为该建议的 label；机器值（value）经 select 事件负载传递。
 */
import type { VNode } from 'vue'

/** 建议的机器值类型。 */
export type AutoCompleteValue = string | number

/** 单个建议（输入形状；value 缺省视为与 label 相同）。 */
export interface AutoCompleteOption {
  /** 建议文本（选中后回填输入框，成为 modelValue）。 */
  label: string
  /** 机器值（select 事件负载携带；缺省回退为 label）。 */
  value?: AutoCompleteValue
  /** 禁用：不可被高亮/选中，渲染为 aria-disabled="true"。 */
  disabled?: boolean
}

/**
 * 归一化后的建议（value 保证存在）：建议列表内部、select 事件负载、
 * option 作用域插槽与自定义 filter 回调均使用该形状。
 */
export interface AutoCompleteSelectedOption {
  label: string
  value: AutoCompleteValue
  disabled?: boolean
}

/**
 * 过滤策略：
 * - true（缺省）→ 默认本地过滤（label 包含关键词，不区分大小写）；
 * - false → 关闭本地过滤（远程模式：options 即使用方已过滤的结果，全量展示）；
 * - 函数 → 自定义本地过滤（入参为归一化建议与当前关键词原文，返回是否保留）。
 *
 * 注意：不使用 `false | fn` 联合并省缺省值——Vue 会把「缺省的 Boolean 型 prop」
 * 铸造为 false 而非 undefined，导致默认过滤失效；故以 true 为缺省语义。
 */
export type AutoCompleteFilter =
  | boolean
  | ((option: AutoCompleteSelectedOption, keyword: string) => boolean)

/** 建议面板打开时键盘高亮的落位端点。 */
export type AutoCompleteEdge = 'first' | 'last'

/** AutoComplete 的 Props。 */
export interface AutoCompleteProps {
  /** v-model 绑定值：输入框文本（值+文本合一，string 受控）。选中建议后为该建议 label；自由输入为输入文本。 */
  modelValue?: string
  /** 建议全集（远程模式下由使用方随 search 结果自行更新）。 */
  options?: AutoCompleteOption[]
  /** 过滤策略：true（缺省）=默认本地过滤；false=关闭本地过滤（远程模式）；函数=自定义本地过滤，见 AutoCompleteFilter。 */
  filter?: AutoCompleteFilter
  /** search 事件防抖毫秒数；0 表示立即发出（不合并连续击键）。 */
  debounce?: number
  /** 加载中：面板空结果时显示加载行（role=status），listbox 置 aria-busy="true"。 */
  loading?: boolean
  /** 占位文本（不替代 label）。 */
  placeholder?: string
  /** 空态文案：建议为空且非加载时面板内显示（empty 插槽可覆盖）。 */
  emptyText?: string
  /** 禁用：原生 disabled（移出 Tab 序）+ 拦截键盘/点击路径 + 不渲染清空按钮。 */
  disabled?: boolean
  /** 可清空：文本非空且非禁用时渲染清空按钮（aria-label="清空"）。 */
  clearable?: boolean
}

/** AutoComplete 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface AutoCompleteEmits {
  /** v-model 更新：键入、清空（''）与选中建议（option.label）时发出。 */
  'update:modelValue': [value: string]
  /** 关键词变化（键入/清空路径）经 debounce 防抖后发出，载荷为当前文本原文；远程搜索挂这里。 */
  search: [keyword: string]
  /** 选中建议后触发，载荷为归一化建议（value 缺省已回退为 label）；文本已随 update:modelValue 同步为 option.label。 */
  select: [option: AutoCompleteSelectedOption]
  /** 点击清空按钮后触发（文本已随 update:modelValue 置 ''，随后走空关键词路径：面板打开 + search('')）。 */
  clear: []
}

/** AutoComplete 的 Slots。 */
export interface AutoCompleteSlots {
  /** 前缀内容（通常是搜索图标；viewBox 0 0 24 24、stroke-width 1.5、currentColor）。 */
  prefix?: () => VNode[]
  /** 后缀内容（渲染于清空按钮之后，通常是单位或说明）。 */
  suffix?: () => VNode[]
  /** 建议项内容；作用域 { option: 归一化建议, index, active: 是否键盘高亮 }，默认渲染 option.label。 */
  option?: (props: { option: AutoCompleteSelectedOption; index: number; active: boolean }) => VNode[]
  /** 空态内容（建议为空且非加载时），默认渲染 emptyText。 */
  empty?: () => VNode[]
}

/** AutoComplete 对外暴露的实例方法。 */
export interface AutoCompleteExpose {
  /** 聚焦原生 input（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点（blur 会关闭已打开的建议面板）。 */
  blur: () => void
}
