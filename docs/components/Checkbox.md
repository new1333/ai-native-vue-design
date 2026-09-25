# Checkbox

> 纸面勾选框：原生 input[type=checkbox] 语义 + 自绘方块视觉，支持半选（indeterminate）与禁用，label prop/插槽二选一。

- **导出名**：`Checkbox`（`@ui/components`）· id `ui-checkbox` · 产品族 Inputs
- **契约来源**：`packages/components/src/checkbox/Checkbox.meta.ts` / `Checkbox.types.ts` / `Checkbox.vue`

## 是什么

一组可多选中的「勾选」语义：受控 `v-model`(boolean)、半选态、可读名称与禁用；勾选即选中，不做即时提交。用户需要把若干选项标记为「已选中/未选中」，并可看到部分选中的中间态。

## 何时用

- 多选场景（列表批量选择、多项同意、多标签筛选）
- 「全选 + 子项」的级联勾选（父项用 indeterminate 表达部分选中）
- 表单中的布尔勾选项（同意协议等，随表单一起提交）
- 需要富文本 label（默认插槽承载链接等内联内容）

## 何时不该用

- 即时生效的开/关设置用 **Switch**：Checkbox 表达「勾选/选中」，不表达「立即切换某状态」
- 多选一用 **Radio**/**RadioGroup**：Checkbox 允许全不选与多选
- 只有文本、无勾选语义的展示用 **Badge** / Typography
- 独立单个开关型动作用 Switch 或 Button：不要用无 label 的 Checkbox

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | v-model 绑定值；受控，原生 change 事件路径更新。 |
| `indeterminate` | `boolean` | `false` | 半选态：视觉为 accent 实底短横线，并同步 DOM indeterminate property（SSR 无法表达，仅客户端 onMounted/watch 同步）；用户点击后浏览器自动清除，父层应随之复位为 false。 |
| `label` | `string` | — | 可读名称；与默认插槽等价，插槽优先。 |
| `disabled` | `boolean` | `false` | 禁用：原生 disabled 属性（移出 Tab 序）+ 灰化 + 拦截切换。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `boolean` | v-model 更新：原生 change 事件路径，载荷为勾选后的布尔值。 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | label 内容（优先于 label prop），可承载链接等内联富文本；点击文本即切换（根为 label 元素）。 |

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `(options?: FocusOptions) => void` | 聚焦原生 checkbox（仅客户端有意义）。 |
| `blur` | `() => void` | 移除焦点。 |

## 可访问性

- 原生 `<input type="checkbox">`：checked/disabled 均为原生语义（不使用 aria-checked / aria-disabled），Tab 自然进入、Space 原生切换。
- 根为 label 元素，点击文本即切换，无需 id/for；`id`/`name`/`aria-label`/`aria-describedby` 等原生属性经 attrs 直达原生 checkbox。
- indeterminate 通过 DOM property 暴露给读屏（客户端 onMounted/watch 同步，SSR 输出不含该属性）。
- 对勾/短横线标记 svg 均 aria-hidden；无可见 label 时必须经 attrs 提供 aria-label。
- 无内建 error 态：校验反馈由外层 FormField 的错误文案与 aria-describedby 承担。

## SSR 行为

`renderToString` 无异常：indeterminate 为 DOM property，SSR 阶段不触碰（onMounted 后同步）；label / checked（true 时输出 checked）/ disabled / attrs（id、aria-label 等）均随 SSR 输出；自绘方块与标记为纯 CSS，SSR 即完整呈现。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@ui/components'

const agreed = ref(false)
</script>

<template>
  <Checkbox v-model="agreed" label="我已阅读并同意服务条款" />
</template>
```
