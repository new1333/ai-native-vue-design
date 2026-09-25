# Input

> 纸面单行输入：原生 input 封装（text/password），带 prefix/suffix 插槽、可清空按钮与错误态（aria-invalid），attrs 全量透传到原生输入框。

- **导出名**：`Input`（`@ui/components`）· id `ui-input` · 产品族 Inputs
- **契约来源**：`packages/components/src/input/Input.meta.ts` / `Input.types.ts` / `Input.vue`

## 是什么

单行文本/密码的输入与编辑：受控 `v-model`(string)、前后缀内容、一键清空、校验错误态，原生属性经 attrs 直达输入框。用户需要输入、编辑或清空一行文本，并感知其校验状态。

## 何时用

- 表单中的单行文本字段（标题、名称、搜索词、用户名等）
- 密码输入（`type="password"`）
- 需要前缀图标 / 后缀单位或图标的紧凑输入
- 需要一键清空的长文本快速重输（clearable）
- FormField 内做校验反馈展示（`status="error"` + aria-describedby）

## 何时不该用

- 多行长文本用 **Textarea**：Input 不支持多行与换行
- 从候选项中选择用 **Select**：自由输入不提供选项约束
- 数值步进、日期选择等专用输入用对应组件：Input 不做键盘步进与弹出面板
- 开/关或勾选语义用 **Switch** / **Checkbox**：Input 只承载自由文本
- 富文本/格式化编辑器：Input 仅纯文本

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | v-model 绑定值；受控，清空按钮点击后以空串更新。 |
| `type` | `'text' \| 'password'` | `'text'` | 原生输入类型子集；password 用于密码场景。 |
| `placeholder` | `string` | — | 占位文本；不替代 label（label 由使用方或 FormField 提供）。 |
| `disabled` | `boolean` | `false` | 禁用：原生 disabled 属性（移出 Tab 序）+ 灰化 + 不渲染清空按钮。 |
| `readonly` | `boolean` | `false` | 只读：原生 readonly 属性（可聚焦可选中、不可编辑）+ 不渲染清空按钮。 |
| `maxlength` | `number` | — | 最大输入长度：透传原生 maxlength，由浏览器原生截断。 |
| `status` | `'default' \| 'error'` | `'default'` | 校验状态：`'error'` 时容器描边转 danger 并推导 `aria-invalid="true"`。 |
| `clearable` | `boolean` | `false` | 可清空：有值且非禁用/只读时渲染清空按钮（aria-label="清空"，点击后焦点交还输入框）。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `string` | v-model 更新：原生 input 事件路径，载荷为输入框最新值。 |
| `clear` | — | 点击清空按钮后触发（值已随 update:modelValue 置空）。 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `prefix` | 输入框前内容（通常是内联 SVG 图标：viewBox 0 0 24 24、stroke-width 1.5、currentColor，尺寸由组件约束为 20）。 |
| `suffix` | 输入框后内容（渲染于清空按钮之后，通常是单位或图标，约束同 prefix）。 |

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `(options?: FocusOptions) => void` | 聚焦原生 input（仅客户端有意义）。 |
| `blur` | `() => void` | 移除焦点。 |

## 可访问性

- 原生 `<input>`（隐式 role=textbox），Tab 自然进入、直接键入；不书写 role/tabindex，不设置 aria-label（label 由 label[for] 或 FormField 提供，placeholder 不承担 label 职责）。
- `status="error"` 推导 `aria-invalid="true"`；aria-describedby 等原生属性经 attrs 直达 input 供 FormField 接入。
- 清空按钮为原生 `<button type="button">`（Enter/Space 平台原生激活），`aria-label="清空"`，图标 svg aria-hidden；点击清空后焦点交还输入框。
- disabled 用原生 disabled 而非 aria-disabled；焦点环由全局 `:focus-visible` 约定提供，容器描边同步转 accent（error 态保持 danger 优先）。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；focus()/blur() 仅出现在客户端事件回调与暴露方法内。placeholder / maxlength / disabled / readonly / type / aria-invalid / 清空按钮 / attrs（id 等）均随 SSR 输出且落位原生 input。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@ui/components'

const title = ref('')
</script>

<template>
  <Input v-model="title" placeholder="文档标题" clearable />
</template>
```
