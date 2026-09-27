/**
 * tree/ —— Tree 的公共类型（Props / Emits / Slots / 扁平可见节点）。
 * 与 Tree.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/**
 * 树节点数据（嵌套结构）。key 必须在全棵树内唯一（字符串）；
 * 不唯一的 key 行为未定义。icon 仅经 #node 插槽作用域透出，
 * 默认渲染不消费（组件内无图标注册表，图标由使用方自行渲染）。
 */
export interface TreeNode {
  /** 全树唯一的节点键。 */
  key: string
  /** 节点标题（默认渲染文本）。 */
  title: string
  /** 子节点；空数组视为叶子（不渲染展开开关）。 */
  children?: TreeNode[]
  /** 禁用：不可选中/勾选（hover 置灰），仍可展开折叠。 */
  disabled?: boolean
  /** 图标标识：仅经 #node 插槽作用域的 icon 透出，由使用方渲染。 */
  icon?: string
}

/** 选中值：multiple=false 时为 string（当前选中键），multiple=true 时为 string[]。 */
export type TreeValue = string | string[]

/** 键盘导航端点（Home/End 的落位方向）；useTree 的 edgeEnabledKey 消费。 */
export type TreeNavigationEdge = 'first' | 'last'

/** select 事件载荷。 */
export interface TreeSelectPayload {
  /** 操作的节点键。 */
  key: string
  /** 操作的节点数据。 */
  node: TreeNode
  /** 事件后该节点是否选中。 */
  selected: boolean
}

/** check 事件载荷（checkedKeys 为全量快照，按树的先序排列）。 */
export interface TreeCheckPayload {
  /** 操作的节点键。 */
  key: string
  /** 操作的节点数据。 */
  node: TreeNode
  /** 事件后该节点自身的勾选意图。 */
  checked: boolean
  /** 事件后全部已勾选键（级联后快照，先序）。 */
  checkedKeys: string[]
}

/** expand 事件载荷（expandedKeys 为全量快照，按树的先序排列）。 */
export interface TreeExpandPayload {
  /** 操作的节点键。 */
  key: string
  /** 操作的节点数据。 */
  node: TreeNode
  /** 事件后该节点是否展开。 */
  expanded: boolean
  /** 事件后全部展开键（快照，先序）。 */
  expandedKeys: string[]
}

/** Tree 的 Props。 */
export interface TreeProps {
  /** 嵌套树数据；组件不改写传入数组。 */
  data: TreeNode[]
  /** 选中值（受控）：single 模式 string，multiple 模式 string[]；不传为非受控（组件内管理，初始无选中）。 */
  modelValue?: TreeValue
  /** 展开键集合（受控）；不传为非受控（初始展开全部父节点）。 */
  expandedKeys?: string[]
  /** 显示勾选框；勾选为组件内状态（级联父子），经 check 事件同步全量 checkedKeys。 */
  checkable?: boolean
  /** 多选：modelValue 为 string[]，点击节点切换选中；缺省单选（string，重复点击已选节点不取消）。 */
  multiple?: boolean
  /** 加载中：渲染 3 行骨架行（aria-hidden）并在 tree 上置 aria-busy="true"，不渲染数据与空态。 */
  loading?: boolean
}

/** Tree 的 Emits（Vue 3.3+ 元组语法）。 */
export interface TreeEmits {
  /** 选中值变化（点击节点 / 键盘 Enter·Space 选中）。 */
  'update:modelValue': [value: TreeValue]
  /** 选中变化：载荷 { key, node, selected }。 */
  select: [payload: TreeSelectPayload]
  /** 勾选变化（级联后）：载荷 { key, node, checked, checkedKeys }。 */
  check: [payload: TreeCheckPayload]
  /** 展开折叠变化：载荷 { key, node, expanded, expandedKeys }。 */
  expand: [payload: TreeExpandPayload]
}

/** #node 插槽作用域。 */
export interface TreeNodeSlotScope {
  /** 节点数据。 */
  node: TreeNode
  /** 节点标题（node.title）。 */
  title: string
  /** 图标标识（node.icon，可 undefined）。 */
  icon: string | undefined
  /** 层级（根为 1）。 */
  level: number
  /** 是否有子节点。 */
  hasChildren: boolean
  /** 是否展开（仅父节点有意义）。 */
  expanded: boolean
  /** 是否选中。 */
  selected: boolean
  /** 是否勾选（checkable 时有意义）。 */
  checked: boolean
  /** 是否半选（checkable 且子节点部分勾选）。 */
  indeterminate: boolean
  /** 是否禁用。 */
  disabled: boolean
}

/**
 * Tree 的 Slots：node 按节点渲染（标题+图标自绘），empty 空态。
 * 以映射类型声明（而非必选索引签名），保证插槽对象与 Vue 的内部插槽结构兼容。
 */
export type TreeSlots = {
  /** 空态内容；仅在非 loading 且 data 为空时出现，缺省渲染“暂无数据”。 */
  empty?: () => VNode[]
} & {
  /** 节点插槽：作用域 { node, title, icon, level, hasChildren, expanded, selected, checked, indeterminate, disabled }；覆盖默认标题渲染。 */
  node?: (scope: TreeNodeSlotScope) => VNode[]
}

/** 可见节点的扁平描述（useTree 的渲染模型；children 折叠的子树不出现）。 */
export interface TreeFlatNode {
  /** 节点数据。 */
  node: TreeNode
  /** 节点键（node.key）。 */
  key: string
  /** 层级（根为 1）。 */
  level: number
  /** 父节点键；根节点为 null。 */
  parentKey: string | null
  /** 是否有子节点。 */
  hasChildren: boolean
  /** 是否展开。 */
  expanded: boolean
  /** 同级序数（1 起，aria-posinset）。 */
  posInSet: number
  /** 同级总数（aria-setsize）。 */
  setSize: number
  /** 可见序（0 起，含跨层级 flatten 后的顺序）。 */
  index: number
}
