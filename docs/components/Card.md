# Card

> 纸面卡片：surface 底 + radius-md + border 描边的复合容器（Card / CardHeader / CardBody / CardFooter），插槽驱动，静止面默认无阴影，可选 rest 一档静止阴影。

- **导出名**：`Card`、`CardHeader`、`CardBody`、`CardFooter`（`@ui/components`）· id `ui-card` / `ui-card-header` / `ui-card-body` / `ui-card-footer` · 产品族 Foundations
- **契约来源**：`packages/components/src/card/Card.meta.ts` / `CardHeader.meta.ts` / `CardBody.meta.ts` / `CardFooter.meta.ts` 及各自 `*.types.ts` / `*.vue`

## 是什么

把相关内容组织到一个有边界面上的静态容器：surface 底、1px 描边、12px 圆角，头部/主体/底部区块由插槽组件组成。用户需要在一块有边界的纸面上阅读一组相关信息。

## 何时用

- 仪表盘中的内容面板（统计、图表、摘要）
- 列表页/详情页的信息分组与排版容器
- 需要标题 + 正文 + 动作区的标准内容块
- 静止面需要可选一档轻微阴影（`shadow="rest"`）做层次区分时

## 何时不该用

- 弹出浮层 / 模态内容用 **Dialog**：Card 无层级行为与焦点管理
- 页面级布局分区（侧栏、顶栏）用 Navigation 家族组件：Card 是内容容器不是框架
- 纯文字排版流（文章正文）不需要卡片包裹时直接排版
- 需要悬浮交互反馈（hover 抬升等）的面板：Card 为静态面，不承载交互态

## Card Props / Slots

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `shadow` | `'none' \| 'rest'` | `'none'` | 阴影档位：默认 `'none'`（静止面默认无阴影）；`'rest'` 应用 `--ui-shadow-rest` 一档静止阴影。 |

| 插槽 | 说明 |
| --- | --- |
| `default` | 卡片内容：通常为 CardHeader / CardBody / CardFooter 的组合（作为直接子元素享受区块间距），也可以是任意内容。 |

## CardHeader / CardBody / CardFooter

三者均无 Props、无事件，仅 `default` 插槽，只提供排版默认值（自身不设边距，区块间距由 Card 的 gap 统一）：

| 组件 | 用途 | 排版默认值 | 插槽说明 |
| --- | --- | --- | --- |
| `CardHeader` | 头部区块：标题/元信息/操作区 | text-lg / semibold / heading 行高 / text-1 | 通常放原生 h1–h6 标题元素（语义层级由使用方决定）与可选操作区。 |
| `CardBody` | 主体区块：正文与嵌入内容 | text-md / body 行高 / text-1 | 正文、表单、表格、图表等任意内容。 |
| `CardFooter` | 底部区块：动作区/补充说明 | text-sm / body 行高 / text-2 | 通常为 Button 动作组或次级说明文字。 |

## 可访问性

- Card 家族均为泛型容器（div，无 role、无 landmark）：不劫持语义，Card 自身不可聚焦、不参与 Tab 序，焦点环只出现在内部可交互子元素上。
- 标题排版由 CardHeader 承担，但语义层级（h1–h6）由使用方以原生标题元素放入插槽决定，组件不代选层级、应保持大纲不跳级。
- 内部可交互元素（button/a/input）保持原生键盘可达；不要在卡片根上做 hover/点击交互，交互放在内部 Button 等元素。

## SSR 行为

`renderToString` 无异常：无浏览器 API 访问、无监听器、无测量；shadow 档位类与插槽内容随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { Card, CardHeader, CardBody, CardFooter, Button } from '@ui/components'
</script>

<template>
  <Card>
    <CardHeader>
      <h3>部署概览</h3>
    </CardHeader>
    <CardBody>最近一次部署于 2 小时前完成。</CardBody>
    <CardFooter>
      <Button size="sm">查看日志</Button>
    </CardFooter>
  </Card>
</template>
```
