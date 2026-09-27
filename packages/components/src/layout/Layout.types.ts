/**
 * layout/ —— Layout 家族（Layout/LayoutHeader/LayoutSider/LayoutContent/LayoutFooter）
 * 的公共类型（Props / Emits / Slots；无对外 Expose）。与 Layout.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** 响应式断点档位：视口宽度低于该档时 LayoutSider 自动折叠、回到以上时自动展开。 */
export type LayoutBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Layout（页面骨架根容器）的 Props：无 props，区域由子组件组装。 */
export type LayoutProps = Record<string, never>

/** Layout 的 Slots。 */
export interface LayoutSlots {
  /**
   * 页面骨架内容：LayoutHeader / LayoutSider / LayoutContent / LayoutFooter 的组装位置。
   * LayoutSider 应作为直接子节点（或经 v-if/v-for 片段），用于触发横向（has-sider）布局；
   * SaaS 经典结构为 Layout > (LayoutSider + Layout > (LayoutHeader + LayoutContent + LayoutFooter))。
   */
  default?: () => VNode[]
}

/** LayoutHeader 的 Slots（无 Props，attrs 透传到语义 header 元素）。 */
export interface LayoutHeaderSlots {
  /** 顶栏内容：品牌、主导航、用户区等。 */
  default?: () => VNode[]
}

/** LayoutSider 的 Props。 */
export interface LayoutSiderProps {
  /** 是否显示折叠触发器（原生 button，键盘可达），默认 false。 */
  collapsible?: boolean
  /** 响应式断点：挂载后按视口宽度自动折叠/展开（matchMedia 仅在 onMounted 接线）；缺省不监听。 */
  breakpoint?: LayoutBreakpoint
  /** 受控折叠态：传入后组件不写内部状态，折叠变化仅发出 sider-collapse，由使用方回写。 */
  collapsed?: boolean
  /** 非受控初始折叠态，默认 false。 */
  defaultCollapsed?: boolean
}

/** LayoutSider 的 Emits（事件名 → 载荷元组）。 */
export interface LayoutSiderEmits {
  /**
   * 折叠态变化：点击折叠触发器、断点跨越（含挂载时视口已在断点以下）时发出；
   * 同值不重复发出。受控模式下仅通知，不改变视觉，需使用方回写 collapsed。
   */
  'sider-collapse': [collapsed: boolean]
}

/** LayoutSider 的 Slots。 */
export interface LayoutSiderSlots {
  /** 侧栏内容：导航菜单、品牌区等；折叠时容器收窄并裁剪溢出。 */
  default?: () => VNode[]
}

/** LayoutContent 的 Slots（无 Props，attrs 透传到语义 main 元素）。 */
export interface LayoutContentSlots {
  /** 主内容区。 */
  default?: () => VNode[]
}

/** LayoutFooter 的 Slots（无 Props，attrs 透传到语义 footer 元素）。 */
export interface LayoutFooterSlots {
  /** 页脚内容：版权、辅助链接等。 */
  default?: () => VNode[]
}
