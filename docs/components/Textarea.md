# Textarea

> 纸面多行文本输入：原生 textarea 封装，带字数统计（右下角弱文字）、垂直拉伸与错误态（aria-invalid），attrs 全量透传到原生控件。

- **导出名**：`Textarea`（`@ui/components`）· id `ui-textarea` · 产品族 Inputs
- **契约来源**：`packages/components/src/textarea/Textarea.meta.ts` / `Textarea.types.ts` / `Textarea.vue`

## 是什么

多行文本的输入与编辑：受控 `v-model`(string)、可见行数、垂直拉伸、字数统计与校验错误态，原生属性经 attrs 直达控件。用户需要输入、编辑或查看一段多行文本，并感知其长度与校验状态。

## 何时用

- 表单中的多行文本字段（描述、备注、正文、反馈等）
- 需要字数限制并展示 x/y 进度（maxlength + showCount）
- FormField 内做校验反馈展示（`status="error"` + aria-describedby）
- 需要用户调整高度的长文本输入（resize 默认 vertical）

## 何时不该用

- 单行短文本用 **Input**：Textarea 的多行排版与拉伸在单行场景是负担
- 开/关或勾选语义用 **Switch** / **Checkbox**：Textarea 只承载自由文本
- 从候选项中选择用 **Select**：自由输入不提供选项约束
- 富文本/Markdown 编辑器：Textarea 仅纯文本

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | v-model 绑定值；受控，原生 input 事件路径更新。 |
| `rows` | `number` | `3` | 可见行数（原生 rows 属性），决定初始高度。 |
| `resize` | `'none' \| 'vertical'` | `'vertical'` | 用户可拉伸方向：默认仅垂直（不破坏容器栅格）；`'none'` 锁定为固定尺寸。 |
| `placeholder` | `string` | — | 占位文本；不替代 label（label 由使用方或 FormField 提供）。 |
| `disabled` | `boolean` | `false` | 禁用：原生 disabled 属性（移出 Tab 序）+ 灰化。 |
| `readonly` | `boolean` | `false` | 只读：原生 readonly 属性（可聚焦可选中、不可编辑）。 |
| `maxlength` | `number` | — | 最大输入长度：透传原生 maxlength，由浏览器原生截断；同时作为字数统计分母 y。 |
| `showCount` | `boolean` | `false` | 显示字数统计：容器右下角弱文字，配 maxlength 为 x/y，无 maxlength 为 x。 |
| `status` | `'default' \| 'error'` | `'default'` | 校验状态：`'error'` 时容器描边转 danger 并推导 `aria-invalid="true"`。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `string` | v-model 更新：原生 input 事件路径，载荷为输入区最新值。 |

## Slots

无。Textarea 不提供插槽；前后缀类需求见 Input 的 prefix/suffix。

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `(options?: FocusOptions) => void` | 聚焦原生 textarea（仅客户端有意义）。 |
| `blur` | `() => void` | 移除焦点。 |

## 可访问性

- 原生 `<textarea>`（隐式 role=textbox），Tab 自然进入、直接键入（Enter 换行为平台原生）；不书写 role/tabindex，不设置 aria-label（label 由 label[for] 或 FormField 提供，placeholder 不承担 label 职责）。
- `status="error"` 推导 `aria-invalid="true"`；aria-describedby 等原生属性经 attrs 直达 textarea 供 FormField 接入。
- 字数统计为可见真实文本（弱文字），读屏可感知长度；maxlength 依赖浏览器原生截断语义。
- disabled 用原生 disabled 而非 aria-disabled；焦点环由全局 `:focus-visible` 约定提供（容器描边经 `:focus-within` 同步转 accent，error 态 danger 优先）。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；focus()/blur() 仅出现在客户端事件回调与暴露方法内。value（渲染为 textarea 内容）、rows / placeholder / maxlength / disabled / readonly / aria-invalid / 字数统计 / attrs（id 等）均随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@ui/components'

const bio = ref('')
</script>

<template>
  <Textarea v-model="bio" :rows="4" :maxlength="200" show-count placeholder="一句话介绍" />
</template>
```
