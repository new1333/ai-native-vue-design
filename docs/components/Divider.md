# Divider

> 纸面分隔线：水平（默认语义 hr，可选居中标签）/垂直方向，细线走 `--ui-border`、间距走 `--ui-space-*`。

- **导出名**：`Divider`（`@ui/components`）· id `ui-divider` · 产品族 Foundations
- **契约来源**：`packages/components/src/divider/Divider.meta.ts` / `Divider.types.ts` / `Divider.vue`

## 是什么

在内容区块之间建立视觉与语义分隔的水平/垂直细线，可选居中标签。用户需要把相邻内容在视觉与语义上分成两块。

## 何时用

- 表单分组、卡片内区块、页面章节之间需要分隔
- 带文字的分隔（如「或」、分组名）用 label 插槽（水平）
- 工具栏/并排内容之间的竖线用 `direction="vertical"`

## 何时不该用

- 仅需要留白不需要线时用布局间距（`--ui-space-*`），不要滥用分隔线
- 列表项之间的分隔用列表自身的分隔样式，不要逐行插 Divider
- 承载交互（折叠分区）用 Accordion 类组件，Divider 纯展示

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 分隔方向；水平且无标签时渲染语义 `<hr>`，带标签或垂直时渲染 `div[role="separator"]`。 |

## Events

无。Divider 为纯展示组件，不发出任何事件。

## Slots

| 插槽 | 说明 |
| --- | --- |
| `label` | 分隔线标签（仅水平生效）：居中展示、两侧细线；提供后根元素由 `<hr>` 变为 `div[role="separator"]`。 |

## 可访问性

- 语义 separator：水平无标签为 `<hr>`（隐式 role=separator）；带标签与垂直形态显式 `role="separator"`，垂直另置 `aria-orientation="vertical"`（ARIA 默认水平）。
- 纯展示不可聚焦，无键盘路径；两侧装饰细线 aria-hidden。
- 标签用 2–4 个字的短词（text-2/13px/500）。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；方向分支（hr / 带标签 div / 垂直 div）在服务端即解析，role 与 aria-orientation 随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { Divider } from '@ui/components'
</script>

<template>
  <p>上半部分内容。</p>
  <Divider><template #label>或</template></Divider>
  <p>下半部分内容。</p>
</template>
```
