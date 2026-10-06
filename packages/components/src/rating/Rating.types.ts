/**
 * rating/ —— Rating 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Rating.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 评分值：星星个数（allowHalf 时以 0.5 为粒度）；undefined 表示未评分。 */
export type RatingValue = number

/** 星形填充态（icon 插槽作用域的 state）。 */
export type RatingIconState = 'full' | 'half' | 'empty'

/** Rating 的 Props。 */
export interface RatingProps {
  /** v-model 当前评分（受控）；undefined 表示未评分。 */
  modelValue?: RatingValue
  /** 星星总数（正整数），默认 5；非正数不渲染任何星。 */
  count?: number
  /** 支持半星：点击与 ←→ 步进以 0.5 为粒度，每颗星拆为左右两个半档 radio。 */
  allowHalf?: boolean
  /** 只读：仅展示评分，禁一切交互（指针/键盘/悬停），aria-readonly="true" 且档位移出 Tab 序。 */
  readonly?: boolean
  /** 可清除：再次点击当前评分档位、或档位聚焦后按 Delete/Backspace 清除为 undefined（生效值归 0 = 全空星）。 */
  clearable?: boolean
}

/** Rating 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface RatingEmits {
  /** v-model 更新：点击/键盘步进选中、clearable 清除；清除时载荷为 undefined。 */
  'update:modelValue': [value: RatingValue | undefined]
  /** 悬停预览变化：进入某档为其值，离开组件为 undefined；只读态不触发。 */
  hoverChange: [value: RatingValue | undefined]
}

/** icon 插槽作用域。 */
export interface RatingIconScope {
  /** 星序号（1 起）。 */
  index: number
  /** 该星满值（= index）。 */
  value: number
  /** 填充态：full / half（仅 allowHalf 出现）/ empty。 */
  state: RatingIconState
}

/** Rating 的 Slots。 */
export interface RatingSlots {
  /** 自定义星形图标（替换默认 SVG）；作用域携带 index / value / state。 */
  icon?: (scope: RatingIconScope) => VNode[]
}

/** Rating 对外暴露的实例方法。 */
export interface RatingExpose {
  /** 聚焦当前 roving tabindex 落点（已选档或首档；只读态无可聚焦档位，调用为空操作）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点（落点与 focus 一致；仅客户端有意义）。 */
  blur: () => void
}
