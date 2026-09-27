/**
 * menu/ —— Menu 家族（Menu/MenuItem/SubMenu）的公共类型
 * （Props / Emits / Slots；无对外 Expose）。与 Menu.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 菜单项配对值：激活项标识（modelValue / select 载荷）；SubMenu 的 value 亦参与派生稳定元素 id。 */
export type MenuValue = string | number

/** 导航方向档位：vertical 纵向侧边导航；horizontal 横向顶栏导航。 */
export type MenuMode = 'horizontal' | 'vertical'

/**
 * items 数据驱动的菜单项描述：
 * 含 children 时渲染为 SubMenu（组节点不可选中，仅展开/收起），否则渲染为 MenuItem。
 */
export interface MenuOption {
  /** 项标识（参与 id 派生与激活匹配）。 */
  value: MenuValue
  /** 项文本（可被 Menu 的 #item 作用域插槽覆盖呈现）。 */
  label: string
  /** 禁用该项/该组。 */
  disabled?: boolean
  /** 子级；非空数组时该项渲染为可展开的子菜单组。 */
  children?: MenuOption[]
}

/** Menu（根容器）的 Props。 */
export interface MenuProps {
  /** 导航方向档位，默认 'vertical'。 */
  mode?: MenuMode
  /**
   * 数据驱动的菜单项（items 模式）；提供时忽略默认插槽。
   * 组合式（MenuItem/SubMenu 子组件）与 items 二选一。
   */
  items?: MenuOption[]
  /** 受控当前激活项（v-model:modelValue）。 */
  modelValue?: MenuValue
  /** 非受控初始激活项；缺省时无激活项（导航菜单不自动选中首项）。 */
  defaultValue?: MenuValue
  /** 图标栏收起态（仅 mode="vertical" 生效；horizontal 下忽略并告警）。 */
  collapsed?: boolean
}

/** Menu 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface MenuEmits {
  /** 激活项变化：用户点击或 Enter/Space 激活叶子项时发出（同值不重复发出）。v-model:modelValue 绑定。 */
  'update:modelValue': [value: MenuValue]
  /** 用户选中某个叶子项时发出（与 update:modelValue 同点触发，供纯事件监听方使用）。 */
  select: [value: MenuValue]
}

/** Menu #item 作用域插槽的载荷（items 模式自定义叶子项内容）。 */
export interface MenuItemScope {
  /** 当前项数据。 */
  item: MenuOption
  /** 是否为当前激活项。 */
  active: boolean
  /** 是否禁用。 */
  disabled: boolean
}

/** Menu #icon 作用域插槽的载荷（items 模式自定义项图标）。 */
export interface MenuIconScope {
  /** 当前项数据。 */
  item: MenuOption
}

/** Menu 的 Slots。 */
export interface MenuSlots {
  /** 组合式子组件（MenuItem/SubMenu）的组装位置；提供 items 时忽略。 */
  default?: () => VNode[]
  /** items 模式：覆盖叶子项内容；scope: { item, active, disabled }。 */
  item?: (scope: MenuItemScope) => VNode[]
  /** items 模式：项图标；scope: { item }。 */
  icon?: (scope: MenuIconScope) => VNode[]
}

/** MenuItem（叶子项）的 Props。 */
export interface MenuItemProps {
  /** 项标识（必填）：激活匹配与 id 派生。 */
  value: MenuValue
  /** 禁用该项：原生 disabled（移出 Tab 序），点击与键盘激活拦截，方向键导航跳过。 */
  disabled?: boolean
}

/** MenuItem 的 Slots。 */
export interface MenuItemSlots {
  /** 项文本/内容（应始终有可读 label）。 */
  default?: () => VNode[]
  /** 项图标（内联 SVG 等）。 */
  icon?: () => VNode[]
}

/** SubMenu（可展开子菜单组）的 Props。 */
export interface SubMenuProps {
  /** 组标识（必填）：参与 id 派生；组节点本身不可选中，不参与激活。 */
  value: MenuValue
  /** 触发器文本；未提供 title 时须使用 #title 插槽，否则触发器无可读名（dev 告警）。 */
  title?: string
  /** 禁用该组：触发器原生 disabled，无法展开/收起。 */
  disabled?: boolean
}

/** SubMenu 的 Slots。 */
export interface SubMenuSlots {
  /** 嵌套的 MenuItem / SubMenu 子级。 */
  default?: () => VNode[]
  /** 触发器文本（覆盖 title prop）。 */
  title?: () => VNode[]
  /** 触发器图标。 */
  icon?: () => VNode[]
}
