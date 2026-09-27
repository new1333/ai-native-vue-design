/**
 * prompt-input/ —— PromptInput 的公共类型（Props / Emits / Slots / Expose）。
 * 与 PromptInput.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** PromptInput 的 Props。 */
export interface PromptInputProps {
  /** v-model 绑定值（string，受控），默认空字符串。 */
  modelValue?: string
  /** 占位文本（不替代 label；无障碍名称可经 attrs 的 aria-label 直达原生 textarea）。 */
  placeholder?: string
  /** 自适应高度的最大行数上限，默认 8；内容超过后输入区内部滚动。 */
  maxRows?: number
  /** Enter 是否发送，默认 true；Shift+Enter 始终换行，IME 组合输入中 Enter 始终不发送。 */
  submitOnEnter?: boolean
  /** 禁用：原生 disabled（移出 Tab 序），内建发送/停止按钮同步禁用。 */
  disabled?: boolean
  /** 加载中：内建发送按钮切换为停止按钮（点击发出 cancel），Enter 不再发送。 */
  loading?: boolean
}

/** PromptInput 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface PromptInputEmits {
  /** v-model 更新（原生 input 事件路径，载荷为输入区最新值）。 */
  'update:modelValue': [value: string]
  /**
   * 提交（Enter 发送或点击内建发送按钮），载荷为提交时的输入值。
   * 不自动清空输入：组件保持纯受控，清空由使用方经 v-model 置空完成。
   */
  submit: [value: string]
  /** 请求停止（加载中点击内建停止按钮）。 */
  cancel: []
}

/** PromptInput 的 Slots。 */
export interface PromptInputSlots {
  /** 输入区上方内容（附件、上下文标签等），仅提供内容时渲染。 */
  prefix?: () => VNode[]
  /** 底部操作区左侧内容（快捷键提示、字数等弱信息），仅提供内容时渲染。 */
  suffix?: () => VNode[]
  /** 底部操作区内容：渲染于内建发送/停止按钮之前（增量扩展，不替换内建按钮）。 */
  actions?: () => VNode[]
}

/** PromptInput 对外暴露的实例方法。 */
export interface PromptInputExpose {
  /** 聚焦原生 textarea（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
