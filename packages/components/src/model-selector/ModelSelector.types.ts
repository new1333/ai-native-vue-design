/**
 * model-selector/ —— ModelSelector 的公共类型（Props / Emits / Slots / Expose / 模型项模型）。
 * 与 ModelSelector.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 模型值类型（以 === 匹配 modelValue，models 内应保持唯一）。 */
export type ModelSelectorValue = string | number

/** 单个可切换的 AI 模型项。 */
export interface ModelSelectorModel {
  /** 模型展示名（触发器与选项上的主文案）。 */
  label: string
  /** 模型值：选中后经 update:modelValue 上抛（组件内以 === 匹配 modelValue）。 */
  value: ModelSelectorValue
  /** 提供方（如 OpenAI / Anthropic / 本地）：渲染为 badge 形态徽标；缺省不渲染徽标。 */
  provider?: string
  /** 禁用该模型：不可被高亮/选中，渲染为 aria-disabled="true"（如无权限/配额售罄）。 */
  disabled?: boolean
}

/** trigger 作用域插槽共享的作用域对象。 */
export interface ModelSelectorTriggerScope {
  /** 当前选中模型（null = 未选，使用方自行决定占位表达）。 */
  model: ModelSelectorModel | null
  /** 弹层是否打开（可用于自绘展开指示）。 */
  open: boolean
}

/** option 作用域插槽共享的作用域对象。 */
export interface ModelSelectorOptionScope {
  /** 当前模型项。 */
  model: ModelSelectorModel
  /** 模型项在 models 中的下标。 */
  index: number
  /** 是否为当前已选模型（aria-selected 同源）。 */
  selected: boolean
  /** 是否为键盘高亮项（aria-activedescendant 同源）。 */
  active: boolean
}

/** ModelSelector 的 Props。 */
export interface ModelSelectorProps {
  /** v-model 绑定值；受控，以 === 匹配 models 的 value，null 表示未选。 */
  modelValue?: ModelSelectorValue | null
  /** 模型全集；value 需唯一，同时用作 key。 */
  models?: ModelSelectorModel[]
  /** 占位文本（无已选模型时显示在触发器内；不替代 label）。 */
  placeholder?: string
  /** 空态文案：models 为空数组且非加载中时弹层内显示。 */
  emptyText?: string
  /** 加载中文案：loading 期间打开弹层显示（替代选项渲染）。 */
  loadingText?: string
  /** 禁用：触发器原生 disabled（移出 Tab 序），拦截开合/键盘/选中。 */
  disabled?: boolean
  /** 模型列表加载中：弹层显示 loadingText、拦截一切选中路径，根级 aria-busy="true"。 */
  loading?: boolean
}

/** ModelSelector 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface ModelSelectorEmits {
  /** v-model 更新：选中某个模型，载荷为其 value。 */
  'update:modelValue': [value: ModelSelectorValue]
  /** 选中某个模型后触发（载荷为该模型对象，含 provider/disabled 字段）；disabled/loading 拦截时不触发。 */
  change: [model: ModelSelectorModel]
}

/** ModelSelector 的 Slots。 */
export interface ModelSelectorSlots {
  /**
   * 触发器内容：渲染在触发器 button 内部（role/键盘/aria 仍由组件承载），
   * 替换默认的「provider 徽标 + 模型名/占位 + 折叠箭标」；不要放入可聚焦元素。
   */
  trigger?: (scope: ModelSelectorTriggerScope) => VNode[]
  /** 单个模型选项内容：按条目作用域定制；缺省渲染 provider 徽标（badge 形态）+ model.label。 */
  option?: (scope: ModelSelectorOptionScope) => VNode[]
}

/** ModelSelector 对外暴露的实例方法。 */
export interface ModelSelectorExpose {
  /** 聚焦触发器按钮（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
