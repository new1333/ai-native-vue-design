/**
 * command-palette/ —— CommandPalette 的公共类型（Props / Emits / Slots / Expose / 数据模型）。
 * 与 CommandPalette.meta.ts 的 api 字段保持一致。
 */
import type { Component, VNode } from 'vue'

/** 命令项数据（面板中的单条可执行命令）。 */
export interface CommandPaletteCommand {
  /** 稳定标识；select 事件的载荷（要求在 groups 全局唯一）。 */
  key: string
  /** 命令文本（同时是搜索过滤的匹配目标）。 */
  label: string
  /** 左侧图标组件（内联 SVG：viewBox 0 0 24 24、stroke-width 1.5、currentColor；组件统一约束为 16px）。 */
  icon?: Component
  /** 右侧提示（快捷键/说明等弱化文本）。 */
  hint?: string
  /** 危险命令：以 danger 色呈现。 */
  danger?: boolean
  /** 禁用命令：不可激活、不可选中（键盘漫游跳过）。 */
  disabled?: boolean
}

/** 分组命令数据。 */
export interface CommandPaletteGroup {
  /** 分组稳定标识（渲染 key 用）。 */
  key: string
  /** 分组标题（渲染为该 role="group" 的可访问名称；缺省时该组不带组标题）。 */
  label?: string
  /** 组内命令。 */
  items: CommandPaletteCommand[]
}

/** item 插槽作用域。 */
export interface CommandPaletteItemScope {
  /** 当前命令数据。 */
  command: CommandPaletteCommand
  /** 是否为当前键盘/悬停激活项（aria-activedescendant 指向项）。 */
  active: boolean
}

/** CommandPalette 的 Props。 */
export interface CommandPaletteProps {
  /** 受控开合（v-model）：true 渲染命令面板浮层。 */
  modelValue?: boolean
  /** 分组命令数据（搜索过滤在其上进行；组内命令全部未命中时整组隐藏）。 */
  groups: CommandPaletteGroup[]
  /** 是否注册全局 Cmd/Ctrl+K 开合快捷键（仅客户端注册，随 prop 动态重接线），默认 true。 */
  hotkey?: boolean
  /** 搜索输入框占位文本，默认 '搜索命令…'。 */
  placeholder?: string
}

/** CommandPalette 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface CommandPaletteEmits {
  /** v-model 更新：热键开合、Esc/遮罩关闭、选中命令后关闭都发出，由使用方落账。 */
  'update:modelValue': [open: boolean]
  /** 选中一条命令（点击或激活项上 Enter；disabled 命令不触发），载荷为该项 key。 */
  select: [key: string]
}

/** CommandPalette 的 Slots。 */
export interface CommandPaletteSlots {
  /** 面板顶部标题区（渲染于搜索框上方，并为 role="dialog" 提供可访问名称）。 */
  header?: () => VNode[]
  /** 单条命令项：作用域 { command, active }；缺省渲染图标 + label + hint。 */
  item?: (scope: CommandPaletteItemScope) => VNode[]
  /** 无匹配结果区：缺省渲染默认「无匹配命令」文案。 */
  empty?: () => VNode[]
}

/** CommandPalette 对外暴露的实例方法。 */
export interface CommandPaletteExpose {
  /** 聚焦搜索输入框（仅在面板打开时有意义；关闭态无输入框可聚焦）。 */
  focus: () => void
  /** 移除搜索输入框焦点。 */
  blur: () => void
}
