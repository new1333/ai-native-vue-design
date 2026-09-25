# EmptyState

> 纸面空态占位：居中的图标 + 标题 + 说明 + 下一步操作，文字克制（text-2/text-3），间距与视觉全走 `--ui-*` token。

- **导出名**：`EmptyState`（`@ui/components`）· id `ui-empty-state` · 产品族 Data
- **契约来源**：`packages/components/src/empty-state/EmptyState.meta.ts` / `EmptyState.types.ts` / `EmptyState.vue`

## 是什么

数据为空 / 无结果 / 尚未开始时的页面级占位：解释空态成因并给出下一步操作入口。用户需要明白「这里为什么是空的」以及「接下来能做什么」。

## 何时用

- 列表、表格、搜索结果为空
- 用户尚未创建任何内容（首次进入）
- 筛选/检索无命中
- 模块未开通或暂无数据的占位说明

## 何时不该用

- 加载中占位用 **Skeleton**：EmptyState 表达「确定没有」而非「还没到」
- 加载失败且可重试的错误态用 Error 类组件或 **Alert**：空态不是错误
- 单条状态提示（如保存失败）用 Alert：EmptyState 是区块/页面级占位
- 模态内的空选择列表若需操作面板，考虑 Dialog + EmptyState 组合而非复用为容器

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 空态标题（一句话，text-2/17px/medium）；缺省时仅渲染图标与可选描述。 |
| `description` | `string` | — | 补充说明（text-3/13px），解释空态成因或引导下一步；限宽 ≈672px 阅读栏。 |

## Events

无。EmptyState 为静态占位组件，不发出任何事件。

## Slots

| 插槽 | 说明 |
| --- | --- |
| `icon` | 图标覆盖；缺省渲染内建克制线稿图标（内联 SVG，viewBox 0 0 24 24、stroke-width 1.5、currentColor、24px，text-3 弱化）。 |
| `action` | 下一步操作区（通常放一个 Button），渲染于描述之下，随容器居中。 |

## 可访问性

- 静态内容区：根为普通 div，不设 role/tabindex/aria-live（空态出现由页面结构表达，不抢读屏注意力）。
- 内建图标与装饰性 svg 均 `aria-hidden="true"` 不进入可读内容；标题与说明为根内普通文本。
- 键盘路径只在 action 插槽的使用方控件上（推荐原生 Button：Tab 可达、Enter/Space 原生激活，全局 `:focus-visible` 提供焦点环）；空态自身无可焦元素。
- 一个空态只给一个主行动按钮；标题写「是什么空」，描述写「为什么/能做什么」。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；无 onMounted 副作用。根类、内建图标 svg、标题/说明、action 插槽内容均随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { EmptyState, Button } from '@ui/components'
</script>

<template>
  <EmptyState
    title="暂无数据"
    description="创建第一条记录后，这里会展示你的数据。"
  >
    <template #action>
      <Button variant="primary">新建记录</Button>
    </template>
  </EmptyState>
</template>
```
