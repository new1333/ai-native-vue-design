/**
 * drawer/ —— Drawer 的公共类型（Props / Emits / Slots / Expose）。
 * 与 Drawer.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 滑出方向：left/right 为纵向抽屉（size 作用于宽度），top/bottom 为横向抽屉（size 作用于高度）。 */
export type DrawerSide = 'left' | 'right' | 'top' | 'bottom'

/** 尺寸档位：作用于滑出轴向的宽/高（左/右抽屉为宽度，上/下抽屉为高度）。 */
export type DrawerSize = 'sm' | 'md' | 'lg'

/** 关闭来源：Esc 键 / 遮罩点击 / 头部关闭按钮。 */
export type DrawerCloseReason = 'esc' | 'scrim' | 'close-button'

/** Drawer 的 Props。 */
export interface DrawerProps {
  /** 受控可见性（v-model）：true 渲染抽屉浮层。 */
  modelValue?: boolean
  /** 滑出方向，默认 'right'。 */
  side?: DrawerSide
  /** 尺寸档位（滑出轴向的宽/高），默认 'md'。 */
  size?: DrawerSize
  /** 是否模态：模态时渲染遮罩、圈定焦点并锁定 body 滚动；非模态时页面保持可交互，默认 true。 */
  modal?: boolean
  /** 模态下点击遮罩是否请求关闭（非模态无遮罩，此 prop 不生效），默认 true。 */
  closeOnScrim?: boolean
}

/** Drawer 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface DrawerEmits {
  /** v-model 更新：一切关闭路径先发出 false，由使用方决定实际状态。 */
  'update:modelValue': [value: boolean]
  /** 请求关闭（update:modelValue false 的同时附带来源）。 */
  close: [reason: DrawerCloseReason]
}

/** Drawer 的 Slots。 */
export interface DrawerSlots {
  /** 头部区：标题/自定义头部内容，渲染进 aria-labelledby 指向的元素；头部右侧始终有内置关闭按钮。 */
  header?: () => VNode[]
  /** 抽屉正文（可滚动区域）。 */
  default?: () => VNode[]
  /** 底部动作区；缺省不渲染底部（关闭走头部按钮 / Esc / 遮罩）。 */
  footer?: () => VNode[]
}

/** Drawer 对外暴露的实例方法。 */
export interface DrawerExpose {
  /** 将焦点移入抽屉（首个可聚焦元素，否则面板自身）；仅客户端有意义。 */
  focus: () => void
}
