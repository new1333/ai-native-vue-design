# Typography

> 纸面排版家族：`Text`（正文/行内文本）与 `Heading`（标题层级）两个公共组件，统一消费 `--ui-text-*` 字阶、`--ui-font-weight-*` 字重与 `--ui-text-1/2/3` 颜色语义。（目录内没有名为 Typography 的组件，本页同时覆盖 `Text` 与 `Heading` 的契约。）

- **导出名**：`Text`、`Heading`（`@ui/components`）· id `ui-text` / `ui-heading` · 产品族 Foundations
- **契约来源**：`packages/components/src/typography/Text.meta.ts` / `Heading.meta.ts` / `Text.types.ts` / `Heading.types.ts` / `Text.vue` / `Heading.vue`

## Text 是什么

承载正文、说明、行内文本的排版组件：任意元素标签（span/p/div）+ 字阶/字重/颜色语义档，默认左对齐，数字可选 tabular-nums。用户需要以统一排版呈现一段文字。

### Text 何时用

- 正文段落、辅助说明、行内标签等常规文本排版
- 需要与全站字阶/字重/文字色一致的任何文本节点
- 数字、金额、指标等需要对齐场景（配 numeric）
- 弱化文案用 `color="text-3"`，次级文案用 `color="text-2"` 或简写 `muted`

### Text 何时不该用

- 标题层级用 **Heading**：h1–h6 语义与默认字重不同，不要用 Text 模拟标题
- 状态标注用 **Badge**（soft 底色语义），不要用彩色文字自造
- 需要交互（链接/按钮）的文本用原生 a/button，Text 不承载交互

### Text Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `'span' \| 'p' \| 'div'` | `'span'` | 渲染的元素标签；正文段落建议 p，行内用 span。 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'md'` | 字号档位，映射 `--ui-text-xs..3xl`（12/13/15/17/20/24/30px），行高随档位按纸面规约取 `--ui-leading-*`。 |
| `weight` | `400 \| 500 \| 600` | `400` | 字重，映射 `--ui-font-weight-regular/medium/semibold`。 |
| `color` | `'text-1' \| 'text-2' \| 'text-3' \| 'muted'` | `'text-1'` | 文字颜色语义档；muted 为 text-2 的简写。 |
| `numeric` | `boolean` | `false` | 数字场景工具档：font-variant-numeric 采用 `--ui-numeric`（tabular-nums）。 |

### Text Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 文本内容。 |

## Heading 是什么

承载页面/区块/卡片标题的排版组件：渲染原生 h1–h6 并统一消费 `--ui-text-*` 字阶与字重。用户需要以正确的层级语义与统一排版呈现一个标题。

### Heading 何时用

- 页面主标题（h1，每页至多一个）与区块标题（默认 h2）
- 卡片、弹窗、分组的层级标题
- 需要与全站字阶一致的大号数字/展示文案（配 numeric）

### Heading 何时不该用

- 正文与说明用 **Text**：Heading 默认 600 字重与标题行高，不适合长文案
- 仅视觉放大、无层级含义的装饰文字用 Text 更大 size 档，避免污染文档大纲
- 状态标注用 **Badge**

### Heading Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'h2'` | 标题层级标签；h1 每页至多一个，常规区块标题用默认 h2。 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'xl'` | 字号档位，映射 `--ui-text-xs..3xl`（默认 20px），行高随档位按标题口径取 `--ui-leading-*`。 |
| `weight` | `400 \| 500 \| 600` | `600` | 字重，映射 `--ui-font-weight-regular/medium/semibold`（默认 semibold）。 |
| `color` | `'text-1' \| 'text-2' \| 'text-3' \| 'muted'` | `'text-1'` | 文字颜色语义档；muted 为 text-2 的简写。 |
| `numeric` | `boolean` | `false` | 数字场景工具档：font-variant-numeric 采用 `--ui-numeric`（tabular-nums）。 |

### Heading Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 标题文本。 |

## 可访问性（Text / Heading）

- 均为纯文本内容，不加 role/aria-*，不设 tabindex；语义由 `as` 指定的原生标签承担（Heading 的 h1–h6 带隐式 heading role + level，不加 role/aria-level）。
- 默认左对齐符合排版规约；numeric 仅影响 font-variant-numeric，不改变读屏内容。
- Heading 应保持页面标题层级连续、不跳级；页面主标题 h1 每页至多一个。
- 两者不可聚焦、无键盘路径、不响应 hover/active；文本间距（margin）交给布局层，组件自身 margin 为 0。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；as 渲染的标签、字号/字重/颜色修饰类随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { Heading, Text } from '@ui/components'
</script>

<template>
  <Heading as="h2">区块标题（h2 / xl / 600）</Heading>
  <Text as="p" color="muted">次级说明文字（等同 color="text-2"）。</Text>
  <Text numeric>1,024.00</Text>
</template>
```
