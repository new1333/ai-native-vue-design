/**
 * splitter/ —— Splitter 与 SplitterPane 的公共类型（Props / Emits / Slots）。
 * 与 Splitter.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 分割方向：horizontal 为左右分栏（分隔条为竖线），vertical 为上下分栏（分隔条为横线）。 */
export type SplitterDirection = 'horizontal' | 'vertical'

/** 单个面板的约束配置（panes 数组项，按面板顺序对位）。 */
export interface SplitterPaneOption {
  /** 面板最小尺寸（占总长的百分比 0-100），默认 0。 */
  min?: number
  /** 面板最大尺寸（占总长的百分比 0-100），默认 100。 */
  max?: number
  /** 是否可折叠：允许尺寸为 0（拖拽吸附越过阈值 / 键盘 Enter 切换），默认 false。 */
  collapsible?: boolean
  /** 面板可读名称：作为其后的分隔条 aria-label；缺省用内置文案。 */
  label?: string
}

/** collapse 事件载荷：面板 index 的折叠状态发生 0 ↔ 非 0 转变。 */
export interface SplitterCollapsePayload {
  /** 发生折叠转变的面板序号（0 起）。 */
  index: number
  /** true = 刚折叠（尺寸变为 0）；false = 刚展开。 */
  collapsed: boolean
}

/** Splitter 的 Props。 */
export interface SplitterProps {
  /**
   * 各面板尺寸（百分比数组，总和 100），v-model 可选受控；
   * 缺省 / 长度与面板数不符 / 含非法值时按面板数均分。
   * 仅在用户交互时触发 update:modelValue；受控更新请整体替换数组。
   */
  modelValue?: number[]
  /** 分割方向，默认 'horizontal'。 */
  direction?: SplitterDirection
  /** 按面板顺序声明的约束（min/max/collapsible/label）；未声明的面板用缺省约束。 */
  panes?: SplitterPaneOption[]
}

/** Splitter 的 Emits（Vue 3.3+ 元组语法）。 */
export interface SplitterEmits {
  /** 尺寸变更（拖拽与键盘路径），载荷为归一后的百分比数组。 */
  'update:modelValue': [sizes: number[]]
  /** 同 update:modelValue 的交互时机，供不使用 v-model 的监听方读取尺寸。 */
  resize: [sizes: number[]]
  /** 某面板发生折叠转变（0 ↔ 非 0）；仅组件内交互触发，外部受控赋值不触发。 */
  collapse: [payload: SplitterCollapsePayload]
}

/** Splitter 的 Slots。 */
export interface SplitterSlots {
  /** 面板序列：应为若干 SplitterPane 直接子组件（决定面板数量与内容），其余子节点不参与布局。 */
  default?: () => VNode[]
}

/** SplitterPane 的 Slots。 */
export interface SplitterPaneSlots {
  /** 面板内容（填充分到的区域，超出可滚动）。 */
  default?: () => VNode[]
}

/** 生效后的单面板约束（min/max 已应用缺省值；useSplitter 的求解输入）。 */
export interface SplitterPaneSpec {
  /** 最小尺寸百分比（含缺省 0）。 */
  min: number
  /** 最大尺寸百分比（含缺省 100）。 */
  max: number
  /** 是否可折叠。 */
  collapsible: boolean
  /** 分隔条 aria-label 来源；undefined 时用内置文案。 */
  label?: string
}
