/**
 * tabs/ —— Tabs 家族（Tabs/TabsList/TabsTrigger/TabsContent）的公共类型
 * （Props / Emits / Slots；无对外 Expose）。与 Tabs.meta.ts 的 api 字段保持一致。
 */
import type { VNode } from 'vue'

/** Tab 配对值：TabsTrigger 与 TabsContent 以同名 value 配对。 */
export type TabsValue = string | number

/** 视觉档位：line 下划线指示；pill 为预留档位（类型已声明，视觉暂未实现）。 */
export type TabsVariant = 'line' | 'pill'

/** Tabs（根容器）的 Props。 */
export interface TabsProps {
  /** 受控当前激活值（v-model:value）。 */
  value?: TabsValue
  /** 非受控初始激活值；缺省时自动激活首个非 disabled 的 trigger。 */
  defaultValue?: TabsValue
  /** 视觉档位，默认 'line'。 */
  variant?: TabsVariant
}

/** Tabs 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface TabsEmits {
  /** 激活值变化：点击 trigger、←→↑↓/Home/End 移动即激活时发出（同值不重复发出）。 */
  'update:value': [value: TabsValue]
}

/** Tabs 的 Slots。 */
export interface TabsSlots {
  /** TabsList 与 TabsContent 的组装位置。 */
  default?: () => VNode[]
}

/** TabsList 的 Slots（无 Props，attrs 透传到 tablist 根元素）。 */
export interface TabsListSlots {
  /** TabsTrigger 序列。 */
  default?: () => VNode[]
}

/** TabsTrigger 的 Props。 */
export interface TabsTriggerProps {
  /** 与 TabsContent 配对的值（必填）。 */
  value: TabsValue
  /** 禁用该 tab：原生 disabled（移出 Tab 序），键盘导航跳过。 */
  disabled?: boolean
}

/** TabsTrigger 的 Slots。 */
export interface TabsTriggerSlots {
  /** 标签文本/内容（应始终有可读 label）。 */
  default?: () => VNode[]
}

/** TabsContent 的 Props。 */
export interface TabsContentProps {
  /** 与 TabsTrigger 配对的值（必填）。 */
  value: TabsValue
}

/** TabsContent 的 Slots。 */
export interface TabsContentSlots {
  /** 面板内容（仅激活时渲染）。 */
  default?: () => VNode[]
}
