/**
 * slider/ —— Slider 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Slider.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 滑块值：单柄为 number；range 模式为 [最小值, 最大值] 有序二元组。 */
export type SliderValue = number | [number, number]

/** 柄选择器：低值柄 / 高值柄（单柄模式恒为 'min'）。 */
export type SliderHandle = 'min' | 'max'

/** 刻度项：落在值轴上的一个刻度点与可选文案。 */
export interface SliderMark {
  /** 刻度对应的值（越界时按轨道百分比钳制展示）。 */
  value: number
  /** 刻度文案；缺省渲染数值本身。 */
  label?: string
}

/** tooltip 插槽作用域。 */
export interface SliderTooltipScope {
  /** 当前柄的数值（已按 step 对齐、钳制）。 */
  value: number
}

/** marks 插槽作用域。 */
export interface SliderMarkScope {
  /** 刻度项。 */
  mark: SliderMark
  /** 该刻度是否已被当前值覆盖（单柄 ≤ 柄值；range 在两柄之间）。 */
  reached: boolean
}

/** Slider 的 Props。 */
export interface SliderProps {
  /** v-model 绑定值（受控）：单柄为 number，range 模式为二元组；未传回落 min / [min, max]。 */
  modelValue?: SliderValue
  /** 双柄范围模式：渲染两个柄，值约束为升序二元组。 */
  range?: boolean
  /** 最小值，默认 0。 */
  min?: number
  /** 最大值，默认 100。 */
  max?: number
  /** 步长，默认 1；方向键按步进，PageUp/PageDown 按 step × 10。 */
  step?: number
  /** 刻度列表（装饰层，aria-hidden；可读值以 aria-valuenow 为准）。 */
  marks?: readonly SliderMark[]
  /** 垂直方向：柄/填充/刻度沿值轴（自下而上增大），需要使用方提供高度容器。 */
  vertical?: boolean
  /** 禁用：柄移出 Tab 序（tabindex=-1）+ aria-disabled，一切取值路径拦截。 */
  disabled?: boolean
  /** 加载中：aria-busy="true" + 拦截取值路径，但不落 disabled（保持可聚焦，同 Switch 先例）。 */
  loading?: boolean
  /** 可读名称：作用于低值柄；range 模式下高值柄固定为「最大值」。 */
  ariaLabel?: string
}

/** Slider 的 Emits（Vue 3.3+ 元组语法）。 */
export interface SliderEmits {
  /** v-model 更新：键盘步进、拖拽移动与轨道点击跳值时连续发出，载荷为最新值。 */
  'update:modelValue': [value: SliderValue]
  /** 提交：键盘步进每键一次；拖拽/轨道点击在抬起（pointerup）且值有变化时发一次。 */
  change: [value: SliderValue]
}

/** Slider 的 Slots。 */
export interface SliderSlots {
  /** 柄值气泡内容（装饰层，aria-hidden，缺省渲染当前数值；hover/focus/拖拽时显示）。 */
  tooltip?: (scope: SliderTooltipScope) => VNode[]
  /** 刻度标签内容（缺省渲染 mark.label ?? mark.value）。 */
  marks?: (scope: SliderMarkScope) => VNode[]
}

/** Slider 对外暴露的实例方法。 */
export interface SliderExpose {
  /** 聚焦柄（handle 缺省为 'min'；单柄模式忽略 'max' 请求，回落 'min'）。 */
  focus: (handle?: SliderHandle) => void
  /** 移除柄焦点。 */
  blur: (handle?: SliderHandle) => void
}
