/**
 * select/ —— Select 的公共类型（Props / Emits / Expose）。
 * 与 Select.meta.ts 的 api 字段保持一致。
 */

/** 选项值类型。 */
export type SelectValue = string | number

/** 单个选项。 */
export interface SelectOption {
  /** 展示文本。 */
  label: string
  /** 选项值（组件内以 === 匹配 modelValue，选项间应保持唯一）。 */
  value: SelectValue
  /** 禁用：不可被高亮/选中，渲染为 aria-disabled="true"。 */
  disabled?: boolean
}

/** Select 的 Props。 */
export interface SelectProps {
  /** v-model 绑定值；受控，null 表示未选（清空后以 null 更新）。 */
  modelValue?: SelectValue | null
  /** 选项全集。 */
  options?: SelectOption[]
  /**
   * v-model:open 受控开合：传入即完全受控（open 跟随外部值，内部交互只发出
   * update:open）；未传则非受控内部自管理。
   */
  open?: boolean
  /** 占位文本（无已选值时显示在触发器内；不替代 label）。 */
  placeholder?: string
  /** 空态文案：options 为空数组时弹层内显示。 */
  emptyText?: string
  /** 禁用：触发器原生 disabled（移出 Tab 序）+ 不渲染清空按钮。 */
  disabled?: boolean
  /** 可清空：有已选值且非禁用时渲染清空按钮（aria-label="清空"，与折叠箭标互换显示）。 */
  clearable?: boolean
}

/** Select 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface SelectEmits {
  /** v-model 更新：选项选中或清空，载荷为选项 value 或 null。 */
  'update:modelValue': [value: SelectValue | null]
  /** v-model:open 更新：受控与非受控均上抛（受控时组件只派发、不自行开合）。 */
  'update:open': [value: boolean]
  /** 点击清空按钮后触发（值已随 update:modelValue 置 null，随后焦点交还触发器）。 */
  clear: []
}

/** Select 对外暴露的实例方法。 */
export interface SelectExpose {
  /** 聚焦触发器按钮（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
