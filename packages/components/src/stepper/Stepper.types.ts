/**
 * stepper/ —— Stepper 的公共类型（Props / Emits / Slots / 步骤项与作用域）。
 * 与 Stepper.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 步骤状态：未到（waiting）/ 进行中（process，默认当前态）/ 已完成（finish）/ 出错（error）。 */
export type StepperStatus = 'waiting' | 'process' | 'finish' | 'error'

/** 排布方向：horizontal（横向，默认）/ vertical（纵向）。 */
export type StepperDirection = 'horizontal' | 'vertical'

/** 单个步骤的配置项（由使用方以 steps 数组提供）。 */
export interface StepperStep {
  /** 步骤标题（必填；可读名的基础，屏幕阅读器据此朗读）。 */
  title: string
  /** 步骤描述（标题下方的辅助说明；可被 description 插槽覆盖）。 */
  description?: string
  /** 禁用该步骤：clickable 下渲染为原生 disabled 按钮，点击与键盘激活被拦截。 */
  disabled?: boolean
}

/** icon / description 插槽的共享作用域。 */
export interface StepperScope {
  /** 当前行对应的步骤配置。 */
  step: StepperStep
  /** 步骤索引（0 起始）。 */
  index: number
  /** 该行派生（或经 status 覆盖）后的状态。 */
  status: StepperStatus
}

/** Stepper 的 Props。 */
export interface StepperProps {
  /** 步骤配置序列（顺序即流程顺序；必填）。 */
  steps: StepperStep[]
  /** 当前步索引（0 起始，v-model 受控；组件自身不持有步状态，点击只发出 update:modelValue）。 */
  modelValue?: number
  /**
   * 当前步的状态覆盖：默认 'process'；置 'error' 时当前步按出错态呈现
   * （已完成步仍为 finish、未到步仍为 waiting）。
   */
  status?: StepperStatus
  /** 排布方向，默认 'horizontal'。 */
  direction?: StepperDirection
  /**
   * 是否允许点击步骤切换：开启后「已完成（finish）」步骤渲染为原生 button，
   * 点击 / Enter / Space 可回退到该步；当前步与未到步（waiting）不可点击，
   * 即只允许回退、不允许跳过未完成步骤前跳。
   */
  clickable?: boolean
}

/** Stepper 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface StepperEmits {
  /** 当前步变化（v-model）：点击可交互步骤时发出，载荷为目标步索引；与当前步相同不发出。 */
  'update:modelValue': [index: number]
  /** 同 update:modelValue 的通知事件：载荷为目标步索引，便于只监听变化不做受控。 */
  change: [index: number]
}

/** Stepper 的 Slots。 */
export interface StepperSlots {
  /** 自定义步骤图标节点内容（替换默认的序号/对勾/叉）；作用域 { step, index, status }。 */
  icon?: (scope: StepperScope) => VNode[]
  /** 自定义步骤描述内容（替换 step.description 文本）；作用域 { step, index, status }。 */
  description?: (scope: StepperScope) => VNode[]
}
