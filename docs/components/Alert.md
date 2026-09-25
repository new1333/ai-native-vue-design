# Alert

> 纸面页内警示条：柔底信息块（severity 语义图标 + 标题 + 正文 + 可选关闭按钮），danger 为 `role="alert"`、其余为 `role="status"`。

- **导出名**：`Alert`（`@ui/components`）· id `ui-alert` · 产品族 Feedback
- **契约来源**：`packages/components/src/alert/Alert.meta.ts` / `Alert.types.ts` / `Alert.vue`

## 是什么

在页面内容流中就地展示一条需要被注意的状态信息（结果反馈、风险提示、系统说明），带 severity 语义色与图标。用户需要看到并理解一条就地呈现的状态信息，并可决定是否将其关闭。

## 何时用

- 操作结果就地反馈（保存成功、校验失败、额度不足等）
- 表单/区块顶部的风险或约束提示（warning/danger）
- 中性说明与公告（info，如功能灰度、维护计划）
- 需要用户主动关闭的驻留提示（closable）

## 何时不该用

- 瞬时通知（自动消失、跨页面存在）用 **Toast**：Alert 驻留在内容流中，不浮层
- 模态阻塞确认用 **Dialog**：Alert 不拦截操作
- 数据为空占位用 **EmptyState**：Alert 表达状态信息而非空态
- 字段级校验错误用 **FormField** 的错误文案：Alert 承载区块级而非单字段信息

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `severity` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | 语义档位：对应 `--ui-{severity}`/`--ui-{severity}-soft` 色与内建语义图标；同时决定 live region 角色（danger 为 alert，其余为 status）。 |
| `title` | `string` | — | 一句话结论标题（text-1/medium）；详细说明放默认插槽正文。 |
| `closable` | `boolean` | `false` | 渲染关闭按钮（原生 button、`aria-label="关闭"`）；点击仅 emit close，组件不自行隐藏。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `close` | — | 点击关闭按钮后触发；显隐由使用方据此处理（如 `v-if` 移除）。 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 正文：详细说明、补充信息或富内容，渲染于标题之下（text-2）。 |
| `icon` | 左侧图标覆盖：缺省时按 severity 渲染内建图标（内联 SVG，viewBox 0 0 24 24、stroke-width 1.5、currentColor、20px，颜色随 severity 语义色）。 |

## 可访问性

- 根为 live region：danger 用 `role="alert"`（隐式 aria-live=assertive，读屏立即播报），info/success/warning 用 `role="status"`（polite）；role 由 severity 推导，勿手工覆盖。
- 关闭按钮为原生 `<button type="button">`（Enter/Space 平台原生激活、Tab 自然进入），`aria-label="关闭"`，图标 svg `aria-hidden="true"`；点击仅 emit close，不抢焦点、不自行隐藏。
- 焦点环由全局 `:focus-visible` 约定提供（2px `--ui-accent` 实线 + 2px 偏移，paper.css）；唯一可焦元素是 closable 的关闭按钮。
- 标题与正文为根内普通文本，读屏随 live region 语义播报；danger 仅用于需要立即被注意的失败/风险。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；无 onMounted 副作用。severity 柔底类名、role、标题/正文、closable 关闭按钮与 aria-label、内建图标 svg 均随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Alert } from '@ui/components'

const show = ref(true)
</script>

<template>
  <Alert
    v-if="show"
    severity="warning"
    title="额度即将用尽"
    closable
    @close="show = false"
  >
    本月 API 额度已使用 90%。
  </Alert>
</template>
```
