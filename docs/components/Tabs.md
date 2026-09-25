# Tabs

> 纸面页签：同一上下文内的多视图切换（Tabs + TabsList + TabsTrigger + TabsContent 组装），line 下划线指示档位，自动激活式键盘导航（roving tabindex）。

- **导出名**：`Tabs`、`TabsList`、`TabsTrigger`、`TabsContent`（`@ui/components`）· id `ui-tabs` · 产品族 Navigation
- **契约来源**：`packages/components/src/tabs/Tabs.meta.ts` / `Tabs.types.ts` / `Tabs.vue` 等四部件

## 是什么

在同级视图/数据切片间切换的页签组件，激活值可受控（`v-model:value`），仅渲染激活面板。四个部件必须组装在 `<Tabs>` 内（provide/inject），缺一失去 tab 语义。用户需要在同一区域的几个平行视图之间快速切换。

## 何时用

- 同屏同级内容的分组切换（概览 / 成员 / 设置）
- 列表的数据切片切换（全部 / 未读 / 已归档）
- 详情页内的区块切换，且希望 URL 外的单值状态驱动

## 何时不该用

- 带步骤顺序的向导流程用 Steps：Tabs 无先后语义，可任意跳转
- 全局/页面级导航用 Sidebar/Topbar：Tabs 作用于局部内容区，不承载路由层级
- 展开/收起的折叠内容用未来的 Collapse：Tabs 是互斥切换，不是显隐

## Props（Tabs 复合组件，按「组件.成员」限定）

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `Tabs.value` | `string \| number` | — | 受控当前激活值（v-model:value）；与 TabsTrigger/TabsContent 的 value 配对。 |
| `Tabs.defaultValue` | `string \| number` | — | 非受控初始激活值；缺省时自动激活首个非 disabled 的 trigger。 |
| `Tabs.variant` | `'line' \| 'pill'` | `'line'` | 视觉档位。line：底部基线 + accent 下划线指示；pill 为预留档位（类型已声明，视觉暂未实现），优先用默认 line。 |
| `TabsTrigger.value`（必填） | `string \| number` | — | 与 TabsContent 配对的值；同时参与派生稳定元素 id。 |
| `TabsTrigger.disabled` | `boolean` | `false` | 禁用该 tab：原生 disabled（移出 Tab 序），点击与键盘激活拦截，方向键导航跳过。 |
| `TabsContent.value`（必填） | `string \| number` | — | 与 TabsTrigger 配对的值；仅该值激活时渲染面板。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:value` | `string \| number` | 激活值变化（点击 trigger、←→↑↓/Home/End 移动即激活时发出；同值不重复发出）。v-model:value 绑定。 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `Tabs.default` | TabsList 与 TabsContent 的组装位置（均应为直接子节点）。 |
| `TabsList.default` | TabsTrigger 序列。 |
| `TabsTrigger.default` | 标签文本/内容；应始终提供可读 label。 |
| `TabsContent.default` | 面板内容，仅激活时渲染（v-if）。 |

## 可访问性

- WAI-ARIA Tabs 模式（automatic activation）：TabsList 为 `role=tablist`；TabsTrigger 为原生 button + `role=tab` + aria-selected + aria-controls（指向配对面板 id）；TabsContent 为 `role=tabpanel` + aria-labelledby（指向配对 trigger id）+ `tabindex=0`（空面板可聚焦）。
- id 由根 uid + value 确定性派生，SSR/重渲染稳定。roving tabindex：仅激活 trigger 在 Tab 序，其余 -1。
- 键盘：←→↑↓ 在 trigger 间循环移动并即激活（跳过 disabled，preventDefault 防滚动）、Home/End 直达首末、Enter/Space 激活当前 trigger；Tab 从激活 trigger 直接移出到面板/后续内容。
- TabsList 上可传 aria-label 描述页签组用途（attrs 透传）；焦点环由全局 `:focus-visible` 约定提供。

## SSR 行为

`renderToString` 无异常：setup/模块顶层不访问浏览器 API；focus() 仅在客户端事件回调执行。激活值（含自动激活首个）与全部 aria/id 在服务端即解析输出，客户端水合后契约一致。

## 性能

仅激活面板渲染（v-if，天然懒加载/卸载）；无监听器、无测量、无定时器；下划线指示用 inset box-shadow，无布局位移。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/components'

const active = ref('draft')
</script>

<template>
  <Tabs v-model:value="active">
    <TabsList aria-label="文章筛选">
      <TabsTrigger value="draft">草稿</TabsTrigger>
      <TabsTrigger value="published">已发布</TabsTrigger>
    </TabsList>
    <TabsContent value="draft">草稿列表…</TabsContent>
    <TabsContent value="published">已发布列表…</TabsContent>
  </Tabs>
</template>
```
