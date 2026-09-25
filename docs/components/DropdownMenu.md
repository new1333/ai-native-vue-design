# DropdownMenu

> 纸面下拉菜单：原生 button 触发器（默认插槽）+ items 数据驱动的 menu 浮层，Teleport 至 body、锚定触发器定位，WAI-ARIA menu 模式键盘契约（roving focus）与外点/Esc 关闭、焦点还原触发器。

- **导出名**：`DropdownMenu`（`@ui/components`）· id `ui-dropdown-menu` · 产品族 Overlays
- **契约来源**：`packages/components/src/dropdown-menu/DropdownMenu.meta.ts` / `DropdownMenu.types.ts` / `DropdownMenu.vue`

## 是什么

把一列动作（编辑/复制/删除等）收纳在触发器下方的浮层菜单中，点开选择其一后立即执行并关闭。用户展开一个动作列表并选择其中一项立即执行。

## 何时用

- 一个入口需要收纳 3~8 个同族动作（行操作、卡片更多操作）
- 空间紧张、不适合平铺 ButtonGroup 的次要动作集
- 动作中混有危险项（删除）需要 danger 色区分

## 何时不该用

- 在表单中选值（需要回显所选值）用 **Select**：DropdownMenu 是动作菜单，不承载选中态
- 两级以上的层级导航用 Nav/Tree：本组件为单层动作列表
- 需要用户必须处理的模态任务用 **Dialog**：菜单不阻断底层交互
- 纯悬浮说明用 Popover/**Tooltip**：菜单项是可执行动作而非内容

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items`（必填） | `DropdownMenuItem[]` | — | 菜单项数据，按序渲染为 menuitem：`{ key, label, icon?, danger?, disabled? }`。icon 为内联 SVG 组件（统一约束 16px）。 |
| `align` | `'start' \| 'end'` | `'start'` | 菜单面板与触发器的水平对齐：start 左缘对齐、end 右缘对齐（纯 CSS 实现，无需测量面板宽度）。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `select` | `string` | 选中菜单项（点击或菜单内 Enter），载荷为该项 key；disabled 项不触发。选中后菜单自动关闭且焦点还原触发器。 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器内容；应始终有可读 label（如「操作」「更多」）。 |

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `(options?: FocusOptions) => void` | 聚焦触发器按钮（仅客户端有意义）。 |
| `blur` | `() => void` | 移除触发器焦点。 |

## 可访问性

- WAI-ARIA menu button 模式：触发器为原生 button，带 `aria-haspopup="menu"` 与 `aria-expanded`（打开时另以 aria-controls 关联菜单 id）；面板 `role="menu"` 且 aria-labelledby 指向触发器；项为原生 button `role="menuitem"`。
- 键盘：触发器 ↓/↑ 打开并聚焦首/末启用项，Enter/Space 开合；菜单内 ↓/↑ 环绕移动（跳过 disabled）、Home/End 首尾、Enter 选中、Esc/Tab 关闭；roving tabindex（当前项 0、其余 -1，disabled 恒 -1）。
- 一切键盘关闭与选中路径焦点还原触发器；外点（document click capture）关闭不抢焦点。
- 禁用项：原生 disabled（移出 Tab 序、roving 跳过）、text-3 弱化、不可选中。

## SSR 行为

SSR-safe：setup 与模块顶层不访问浏览器 API；浮层仅客户端渲染（mounted 门控 + Teleport，isOpen 初始 false），`renderToString` 只输出触发器（含 ui-dropdown-menu 根类与 aria-haspopup/aria-expanded），无浮层内容泄出；document/window 监听只在 onMounted 注册、onBeforeUnmount 移除。

## 最小用例

```vue
<script setup lang="ts">
import { DropdownMenu } from '@ui/components'

function onSelect(key: string) {
  // key: 'edit' | 'copy' | 'delete'
}
</script>

<template>
  <DropdownMenu
    :items="[
      { key: 'edit', label: '编辑' },
      { key: 'copy', label: '复制' },
      { key: 'delete', label: '删除', danger: true },
    ]"
    @select="onSelect"
  >
    操作
  </DropdownMenu>
</template>
```
