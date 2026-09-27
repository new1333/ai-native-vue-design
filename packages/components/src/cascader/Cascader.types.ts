/**
 * cascader/ —— Cascader 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Cascader.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 选项值类型（与 Select 家族一致：字符串或数字）。 */
export type CascaderValue = string | number

/** 从根节点到某节点的值路径（modelValue 以路径表达）。 */
export type CascaderPath = CascaderValue[]

/** v-model 绑定值：单选为一条路径，多选为路径数组，null 表示未选。 */
export type CascaderModelValue = CascaderPath | CascaderPath[] | null

/** 次级面板的展开触发方式。 */
export type CascaderExpandTrigger = 'click' | 'hover'

/** 级联选项（树节点）。children 为空数组或缺省时视为叶子。 */
export interface CascaderOption {
  /** 展示文本。 */
  label: string
  /** 选项值（同一父节点下应保持唯一，组件内以 === 匹配）。 */
  value: CascaderValue
  /** 禁用：不可被高亮/悬停展开/选中，渲染为 aria-disabled="true"。 */
  disabled?: boolean
  /** 子级选项；缺省或空数组视为叶子（可被选中的终点）。 */
  children?: CascaderOption[]
}

/** Cascader 的 Props。 */
export interface CascaderProps {
  /** v-model 绑定值；受控。单选为一条路径（如 ['cn-zj','cn-zj-hz']），多选为路径数组，null 表示未选。 */
  modelValue?: CascaderModelValue
  /** 级联选项树（根级数组，子级经 children 逐层展开）。 */
  options?: CascaderOption[]
  /** 占位文本（无已选值时显示在触发器内；不替代 label）。 */
  placeholder?: string
  /** 空态文案：options 为空数组时弹层内显示（可用作加载中兜底）。 */
  emptyText?: string
  /** 禁用：触发器原生 disabled（移出 Tab 序）+ 拦截开合/键盘/悬停。 */
  disabled?: boolean
  /** 多选：叶子节点渲染原生 checkbox，modelValue 为路径数组；勾选后弹层保持打开以便连续勾选。 */
  multiple?: boolean
  /** 次级面板展开触发方式：'click'（默认，点击展开）或 'hover'（悬停展开）。 */
  expandTrigger?: CascaderExpandTrigger
  /** 选中任意层级：开启后父节点也可提交路径（单选模式）；关闭时仅叶子可提交，父节点只展开。 */
  changeOnSelect?: boolean
}

/** Cascader 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface CascaderEmits {
  /** v-model 更新：单选载荷为选中路径 CascaderPath，多选载荷为勾选路径数组 CascaderPath[]。 */
  'update:modelValue': [value: CascaderPath | CascaderPath[]]
  /** 选中/勾选提交后触发，载荷与 update:modelValue 一致。 */
  change: [value: CascaderPath | CascaderPath[]]
}

/** option 插槽作用域。 */
export interface CascaderOptionSlotScope {
  /** 当前选项节点。 */
  option: CascaderOption
  /** 所在面板层级（根级为 0）。 */
  level: number
  /** 根到该节点的值路径。 */
  path: CascaderPath
}

/** trigger 插槽作用域。 */
export interface CascaderTriggerSlotScope {
  /** 已选（可解析）路径全集：单选至多一条，多选为勾选路径。 */
  paths: CascaderPath[]
  /** 与 paths 一一对应的 label 链（如 [['浙江省','杭州市']]）。 */
  labels: string[][]
  /** 是否多选模式。 */
  multiple: boolean
}

/** Cascader 的 Slots。 */
export interface CascaderSlots {
  /** 自定义触发器已选内容（替代默认的路径 label 文案）。 */
  trigger?: (scope: CascaderTriggerSlotScope) => VNode[]
  /** 自定义选项内容（替代默认 label 文案；行容器的角色/键盘/选中样式仍由组件承担）。 */
  option?: (scope: CascaderOptionSlotScope) => VNode[]
}

/** Cascader 对外暴露的实例方法。 */
export interface CascaderExpose {
  /** 聚焦触发器按钮（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
