# Tooltip

> 纸面纯提示浮层：包裹单个触发元素（默认插槽、无包装 DOM），hover/focus 进入 150ms 后显示、离开/失焦/Esc 立即隐藏；浮层 Teleport 至 body，`role="tooltip"` 经 aria-describedby 与触发元素关联，挂载后按触发元素 rect 定位（top/bottom/left/right）。

- **导出名**：`Tooltip`（`@ui/components`）· id `ui-tooltip` · 产品族 Overlays
- **契约来源**：`packages/components/src/tooltip/Tooltip.meta.ts` / `Tooltip.types.ts` / `Tooltip.vue`

## 是什么

在触发元素附近悬浮显示一段简短的纯文字补充说明（术语解释、快捷键、截断文本的完整内容），不承载任何交互。用户悬停或键盘聚焦某元素时，获得一句即看即走的补充说明。

## 何时用

- 为图标按钮/紧凑控件补充一句可访问名称之外的说明
- 解释专业术语、缩写或表单项的填写要求
- 展示被截断文本（表格单元格、面包屑）的完整内容

## 何时不该用

- 需要菜单项/导航/选择动作 → **DropdownMenu**：Tooltip 是纯提示，浮层无交互内容、无焦点停留、无键盘漫游
- 需要富内容与内部交互（链接、按钮、图表）→ Popover：Tooltip 浮层 pointer-events:none，鼠标无法停留其上
- 需要用户必须处理的模态信息 → **Dialog**：Tooltip 不阻断交互、不圈定焦点
- 需要被动通知（保存成功等）→ **Toast**：Tooltip 由触发元素的 hover/focus 驱动，不主动弹出

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 浮层相对触发元素的方向；打开期间切换会按新方向重排（不做视口碰撞翻转）。 |

## Events

无。显隐是内部状态，无自定义事件与 expose；交互契约走 aria-describedby 与 DOM。

## Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 唯一触发元素（应为恰一个可聚焦/可交互元素）：组件向其克隆合并 hover/focus/Esc 监听器与 aria-describedby，并透传写在 `<Tooltip>` 上的 attrs。 |
| `content` | 浮层提示内容；未提供该插槽时不弹层。 |

## 可访问性

- 浮层 `role="tooltip"` 且 id 由 useId 生成；打开时触发元素挂 aria-describedby 指向浮层 id（关闭时移除，读屏以 describedby 关系朗读提示）。
- 键盘可达：Tab 聚焦触发元素（focusin）即显示、失焦（focusout）即隐藏、Esc 立即关闭；触发元素不添加 tabindex、不自造交互语义。
- 浮层自身不可聚焦（无 tabindex）、pointer-events:none，不进入 Tab 序也不抢夺焦点——这是与 DropdownMenu（菜单项可漫游、焦点停留）的本质边界。
- 触发元素保持原生交互语义（button/a/input…）；提示内容一句话以内（超过请改用 Popover 或正文说明）。

## SSR 行为

SSR-safe：setup 与模块顶层不访问浏览器 API；`renderToString` 输出触发元素 + hidden 的 ui-tooltip 占位（输出稳定、含根类），不渲染浮层与提示内容、不输出 aria-describedby；Teleport、rect 测量与延迟计时全部推迟到客户端 onMounted 之后；卸载时清理待显示计时器。

## 性能

无持续监听：不监听 resize/scroll（打开期间视口变化不自动重排，重新触发即重算）；仅在显示路径创建一个 150ms 计时器，隐藏/卸载立即清理；定位为单段测量（rect + 结构性 translate 居中）。placement 只做四方向定位，不做视口碰撞翻转；需要翻转/跟随滚动请在上层方案解决。

## 最小用例

```vue
<script setup lang="ts">
import { Tooltip, IconButton } from '@ui/components'
</script>

<template>
  <Tooltip placement="top">
    <IconButton aria-label="删除">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <!-- 垃圾桶图标路径 -->
      </svg>
    </IconButton>
    <template #content>移除该行，不可撤销</template>
  </Tooltip>
</template>
```
