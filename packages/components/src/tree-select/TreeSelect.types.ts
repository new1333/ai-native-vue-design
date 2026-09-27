/**
 * tree-select/ —— TreeSelect 的公共类型（Props / Emits / Expose）。
 * 与 TreeSelect.meta.ts 的 api 字段保持一致。
 */
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'

/** 树节点值类型。 */
export type TreeSelectNodeValue = string | number

/** 高亮导航的方向/边缘。 */
export type TreeSelectNavigationEdge = 'first' | 'last'

/** 单个树节点。children 非空数组即为可展开节点。 */
export interface TreeSelectOption {
  /** 展示文本。 */
  label: string
  /** 节点值（组件内以 === 匹配，整棵树内应保持唯一）。 */
  value: TreeSelectNodeValue
  /** 禁用：自身与子树均不可被选中/勾选，键盘导航自动跳过。 */
  disabled?: boolean
  /** 子节点；空数组视为叶子节点。 */
  children?: TreeSelectOption[]
}

/**
 * v-model 绑定值：
 * - 单选（multiple=false 且 checkable=false）：TreeSelectNodeValue | null；
 * - 多选/复选（multiple=true 或 checkable=true）：TreeSelectNodeValue[]（clear 后为 []）。
 */
export type TreeSelectModelValue = TreeSelectNodeValue | TreeSelectNodeValue[] | null

/** TreeSelect 的 Props。 */
export interface TreeSelectProps {
  /** v-model 绑定值；受控，语义随 multiple / checkable 变化（见 TreeSelectModelValue）。 */
  modelValue?: TreeSelectModelValue
  /** 树形选项全集（嵌套 children）。 */
  options?: TreeSelectOption[]
  /** 多选：点击节点切换选中/取消，弹层保持打开；值为数组。 */
  multiple?: boolean
  /** 复选：节点渲染复选框，父子级联（父勾选展开到子树，父全勾选才记为勾选、部分勾选为半选）；值为数组。 */
  checkable?: boolean
  /** 占位文本（无已选值时显示在触发器内；不替代 label）。 */
  placeholder?: string
  /** 空态文案：options 为空数组时树面板内显示。 */
  emptyText?: string
  /** 禁用：触发器原生 disabled（移出 Tab 序）+ 不渲染清空按钮。 */
  disabled?: boolean
  /** 可清空：有已选值且非禁用时渲染清空按钮（aria-label="清空"，与折叠箭标互换显示）。 */
  clearable?: boolean
}

/** TreeSelect 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface TreeSelectEmits {
  /** v-model 更新：单选为选项 value 或 null（清空）；多选/复选为 value 数组（清空为 []）。 */
  'update:modelValue': [value: TreeSelectModelValue]
  /** 选中/勾选变化后触发（与 update:modelValue 同载荷；清空按钮不触发 change，只触发 clear）。 */
  change: [value: TreeSelectModelValue]
  /** 点击清空按钮后触发（值已随 update:modelValue 置 null/[]，随后焦点交还触发器）。 */
  clear: []
}

/** TreeSelect 对外暴露的实例方法。 */
export interface TreeSelectExpose {
  /** 聚焦触发器按钮（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}

/** useTreeSelect 的配置项（composable 公共类型）。 */
export interface UseTreeSelectOptions {
  /** 树形选项全集来源（响应式）。 */
  options: MaybeRefOrGetter<TreeSelectOption[]>
  /** 禁用总闸（响应式）：一切开合/导航/激活路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean>
  /**
   * 激活后是否保持弹层打开（响应式）：multiple / checkable 为 true，
   * 单选为 false（激活即选中并关闭）。
   */
  stayOpen?: MaybeRefOrGetter<boolean>
  /** 打开落位参考：单选已选值 / 多选首值（响应式；null = 未选）。 */
  primaryValue?: MaybeRefOrGetter<TreeSelectNodeValue | null>
  /** 节点激活（点击 / Enter / Space）的唯一出口回调（组件把选中语义挂到这里）。 */
  onActivate?: (option: TreeSelectOption) => void
}

/** useTreeSelect 返回值。 */
export interface UseTreeSelectReturn {
  /** 树面板是否打开。 */
  open: Ref<boolean>
  /** 当前高亮节点在可见扁平列表中的下标（-1 = 无高亮；关闭时复位）。 */
  activeIndex: Ref<number>
  /** 已展开节点值集合（响应式替换式更新）。 */
  expanded: Ref<ReadonlySet<TreeSelectNodeValue>>
  /** 按展开状态派生的可见节点扁平列表（aria-level 从 1 起）。 */
  visibleNodes: ComputedRef<TreeSelectVisibleNode[]>
  /** 整棵树的节点索引（value → 记录，含父链），供值查找/级联计算复用。 */
  records: ComputedRef<Map<TreeSelectNodeValue, TreeSelectNodeRecord>>
  /** 展开指定节点。 */
  expand: (value: TreeSelectNodeValue) => void
  /** 折叠指定节点。 */
  collapse: (value: TreeSelectNodeValue) => void
  /** 展开 <-> 折叠切换。 */
  toggleExpand: (value: TreeSelectNodeValue) => void
  /** 打开树面板；高亮落位 = 已选值（展开其父链）优先，否则 edge 端首个可选节点。 */
  openList: (edge?: TreeSelectNavigationEdge) => void
  /** 关闭面板并复位高亮。 */
  closeList: () => void
  /** 开 <-> 关切换（disabled 拦截）。 */
  toggleList: () => void
  /** 高亮移动 step 步：跳过 disabled 节点，在可选集合两端夹住。 */
  moveActive: (step: 1 | -1) => void
  /** 高亮跳到首个/末个可选节点。 */
  toEdge: (edge: TreeSelectNavigationEdge) => void
  /** 高亮进入活动节点的首个可见子节点（ArrowRight 已展开分支）。 */
  moveIntoFirstChild: () => void
  /** 高亮移动到活动节点的父节点（ArrowLeft 已折叠分支）；根节点不动。 */
  moveToParent: () => void
  /**
   * 键盘状态机（绑定在触发器 keydown）：
   * 受理键一律 preventDefault（含 Space 滚动与原生 button 二次激活），其余键放行。
   */
  handleKeydown: (event: KeyboardEvent) => void
}

/** 可见节点（扁平渲染行）。 */
export interface TreeSelectVisibleNode {
  /** 节点数据。 */
  option: TreeSelectOption
  /** 层级（1 起，用于 aria-level 与缩进）。 */
  level: number
  /** 是否可展开（children 为非空数组）。 */
  expandable: boolean
}

/** 节点索引记录（value → 父链/层级），供值查找与级联计算。 */
export interface TreeSelectNodeRecord {
  /** 节点数据。 */
  option: TreeSelectOption
  /** 父节点（根为 null）。 */
  parent: TreeSelectOption | null
  /** 层级（1 起）。 */
  level: number
}
