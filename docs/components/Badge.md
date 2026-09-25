# Badge

> 纸面状态徽标：neutral/success/warning/danger/info 五档 soft 底 + 同系文字色，可选前置小圆点，纯展示无交互。

- **导出名**：`Badge`（`@ui/components`）· id `ui-badge` · 产品族 Foundations
- **契约来源**：`packages/components/src/badge/Badge.meta.ts` / `Badge.types.ts` / `Badge.vue`

## 是什么

以 soft 底色块标注对象的状态或属性（如「进行中」「已失败」「Beta」）的静态徽标。用户需要一眼识别对象的状态类别。

## 何时用

- 表格行、详情页、列表项的状态标注
- 版本/环境/渠道等属性标签（neutral）
- 配 dot 表达「运行中/在线」等轻量状态

## 何时不该用

- 计数值/未读数等数字溢出场景（max 数字溢出如 99+ 暂未实现，不要用 Badge 承载计数）
- 可点击的过滤/筛选标签（那是交互组件，Badge 不承载交互）
- 大段说明文字用 **Text**，不要塞进徽标

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` | 状态语义档位：soft 底 `--ui-*-soft` + 同系文字色 `--ui-*`；neutral 取 surface-muted/text-2。 |
| `dot` | `boolean` | `false` | 前置小圆点（纯装饰 aria-hidden），颜色随同系文字色（currentColor）。 |

## Events

无。Badge 为纯展示组件，不发出任何事件。

## Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 徽标文本（建议 2–6 字的状态词）。 |

## 可访问性

- 纯文本语义，不加 role/aria-*、不设 tabindex；状态信息由徽标文本本身承载——**不要只靠圆点颜色传达状态**，始终提供文本。
- `dot` 为 aria-hidden 装饰；文字颜色即语义，不要为徽标引入第四种颜色。
- 非交互元素：不可聚焦、无键盘路径、不响应 hover/active。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；variant 修饰类与 dot 圆点随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { Badge } from '@ui/components'
</script>

<template>
  <Badge variant="success">已完成</Badge>
  <Badge variant="danger" dot>服务异常</Badge>
</template>
```
