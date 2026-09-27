/**
 * toggle-group/ —— ToggleGroup 与 ToggleItem 的公共类型（Props / Emits / Slots / 注入上下文）。
 * 与 ToggleGroup.meta.ts 的 api 字段保持一致。
 */
import type { ComputedRef, Ref, VNode } from 'vue'

/** 选项值类型（字符串或数字；1 与 '1' 视为不同值）。 */
export type ToggleValue = string | number

/** 选择模式：single 单选分段（radiogroup 语义）；multiple 多选分段（group + toggle button 语义）。 */
export type ToggleGroupType = 'single' | 'multiple'

/** 视觉形态：segmented 分段轨道（默认）；outline 描边按钮组。 */
export type ToggleGroupVariant = 'segmented' | 'outline'

/** items prop 的选项描述。 */
export interface ToggleItemOption {
  /** 该项对应的值（必填；选中路径以此为载荷）。 */
  value: ToggleValue
  /** 可读名称（作为按钮内容渲染，也是无 item 插槽时的回退文案）。 */
  label: string
  /** 单项禁用（与组 disabled 取或，原生 disabled）。 */
  disabled?: boolean
}

/** item 作用域插槽的载荷。 */
export interface ToggleItemSlotScope {
  /** items prop 中的原始选项对象。 */
  item: ToggleItemOption
  /** 该项当前是否选中。 */
  selected: boolean
}

/** modelValue 的合法形态：single 下为单值（未选为 undefined）；multiple 下为数组。 */
export type ToggleGroupModelValue = ToggleValue | ToggleValue[]

/** ToggleGroup 的 Props。 */
export interface ToggleGroupProps {
  /** v-model 绑定值：single 为单值（未选 undefined）；multiple 为数组。受控。 */
  modelValue?: ToggleGroupModelValue
  /** 选择模式：'single'（默认，radiogroup）或 'multiple'（group）。 */
  type?: ToggleGroupType
  /** 视觉形态：'segmented'（默认，分段轨道）或 'outline'（描边按钮组）。 */
  variant?: ToggleGroupVariant
  /** 声明式选项：传入后由组件内部渲染 ToggleItem；与默认插槽可并存（items 渲染在后）。 */
  items?: ToggleItemOption[]
  /** 整组禁用：组内全部 ToggleItem 原生 disabled（移出 Tab 序）。 */
  disabled?: boolean
}

/** ToggleGroup 的 Emits（Vue 3.3+ 元组语法）。 */
export interface ToggleGroupEmits {
  /**
   * v-model 更新：single 载荷为新选中的单值（single 不反选，重复点击不发）；
   * multiple 载荷为切换后的完整选中数组。
   */
  'update:modelValue': [value: ToggleValue | ToggleValue[]]
  /** change 与 update:modelValue 同步发出，载荷一致（供只关心变化本身的监听方使用）。 */
  change: [value: ToggleValue | ToggleValue[]]
}

/** ToggleGroup 的 Slots。 */
export interface ToggleGroupSlots {
  /** 手动组合：放置若干 ToggleItem（渲染序即注册序，items prop 渲染的内容追加在后）。 */
  default?: () => VNode[]
  /**
   * item 内容定制（配合 items prop）：每个内部 ToggleItem 的按钮内容。
   * 未提供时回退为 option.label。
   */
  item?: (scope: ToggleItemSlotScope) => VNode[]
}

/** ToggleItem 的 Props。 */
export interface ToggleItemProps {
  /** 该项对应的值（必填；选中路径以此为载荷）。 */
  value: ToggleValue
  /** 可读名称；与默认插槽等价，插槽优先（用于图标 + 文本等富内容）。 */
  label?: string
  /** 单项禁用（与组 disabled 取或，原生 disabled）。 */
  disabled?: boolean
}

/** ToggleItem 的 Slots。 */
export interface ToggleItemSlots {
  /** 按钮内容（优先于 label prop）。 */
  default?: () => VNode[]
}

/** ToggleItem 对外暴露的实例方法。 */
export interface ToggleItemExpose {
  /** 聚焦该项按钮（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}

/** ToggleGroup 对外暴露的实例方法。 */
export interface ToggleGroupExpose {
  /**
   * 聚焦组内当前 roving-active 项（未确定时为首个可用项）；仅客户端有意义。
   * 组内全部项禁用时无焦点可落，为空操作。
   */
  focus: () => void
}

/** roving tabindex 焦点移动的偏移：相邻（±1）或端点（first / last）。 */
export type ToggleFocusOffset = 1 | -1 | 'first' | 'last'

/** ToggleItem 向组注册的记录（组用于 roving tabindex 与焦点导航）。 */
export interface ToggleItemRecord {
  /** 组内唯一自增 id（注册序即默认 DOM 序）。 */
  id: number
  /** 取该项按钮元素的闭包（元素引用在 mounted 后才可用，SSR 期为 null）。 */
  el: () => HTMLButtonElement | null
  /** 取该项当前是否禁用的闭包（响应单项与整组禁用的实时变化）。 */
  disabled: () => boolean
}

/** ToggleGroup → 组内 ToggleItem 的注入上下文（provide/inject 契约）。 */
export interface ToggleGroupContext {
  /** 选择模式（响应式）。 */
  type: ComputedRef<ToggleGroupType>
  /** 视觉形态（响应式，项据此落形态修饰类）。 */
  variant: ComputedRef<ToggleGroupVariant>
  /** 整组禁用（响应式）。 */
  disabled: ComputedRef<boolean>
  /** 当前选中值集合（响应式，single 为 0/1 个元素，multiple 为数组）。 */
  selectedValues: ComputedRef<ToggleValue[]>
  /** 该值是否选中。 */
  isSelected: (value: ToggleValue) => boolean
  /** 选中/切换某值：由 ToggleItem 在点击路径调用，ToggleGroup 发出 update:modelValue 与 change。 */
  select: (value: ToggleValue) => void
  /** 注册一项，返回组内唯一 id（项 setup 期同步调用，SSR 亦生效）。 */
  registerItem: (record: Omit<ToggleItemRecord, 'id'>) => number
  /** 注销一项；若其为 roving-active 则交还 fallback。 */
  unregisterItem: (id: number) => void
  /** 当前 roving-active 项 id（undefined 时回退 firstEnabledId）。 */
  activeId: Ref<number | undefined>
  /** 首个可用（未禁用）项 id；全部禁用时为 undefined（组不可 Tab 进入）。 */
  firstEnabledId: ComputedRef<number | undefined>
  /** 标记某项为 roving-active（项 focus 事件同步）。 */
  setActive: (id: number) => void
  /** 若 id 是 roving-active 则清除（项被禁用/注销时交还 fallback）。 */
  resignActive: (id: number) => void
  /** roving 焦点移动：相邻 ±1（环绕、跳过禁用项）或端点。 */
  moveFocus: (id: number, offset: ToggleFocusOffset) => void
}
