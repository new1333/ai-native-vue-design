# Form

> 纸面表单容器：原生 form 封装（novalidate），rules 声明式校验（同步/异步），全量通过才 emit submit，pending 拦截重复提交，并经 provide/inject 向 FormField 分发字段错误。

- **导出名**：`Form`、`FormField`（`@ui/components`）· id `ui-form` / `ui-form-field` · 产品族 Inputs
- **契约来源**：`packages/components/src/form/Form.meta.ts` / `FormField.meta.ts` / `Form.types.ts` / `FormField.types.ts` / `Form.vue` / `FormField.vue`

## 是什么

**Form** 把一组表单字段组织为一次受控提交：提交前按 rules 全量校验，失败错误分发到各 FormField 展示，通过才发出 submit；pending 期间拦截提交防重复。**FormField** 为单个控件补齐字段级语义：可读 label、必填标记、帮助文案与校验错误文案，并完成控件与文案的无障碍关联。

## 何时用（Form）

- 登录 / 注册 / 设置 / 创建等需要校验后提交的表单
- 异步校验（唯一性检查等，校验函数返回 Promise）
- 异步提交中需要以 pending 禁用提交按钮并拦截重复提交
- 需要主动触发校验或清空校验状态（expose validate / resetValidation）

## 何时不该用（Form）

- 嵌套字段 / 数组字段 / 字段联动 / schema 驱动等 Form Engine 能力（设计文档第二阶段）暂不支持，请勿依赖
- 纯展示的数据详情区用 Typography/Card 组合，不要套 Form
- 即时搜索等无需提交语义的输入组合直接用 Input，不必包 Form

**FormField 何时用**：字段需要 label / required / help / 错误文案的统一排版与 aria 关联；Form 内接收校验错误并联动控件 aria-invalid（按 name 匹配）；无 Form 的独立场景（搜索条、单字段设置项）用 error prop 自行展示错误。**不该用**：只要控件不要字段语义时直接用控件本身；复杂布局的字段组（栅格、多列）由使用方自行组合。

## Form Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `model`（必填） | `Record<string, unknown>` | — | 表单数据对象：校验时 rules 按字段名从此取值传给校验函数。 |
| `rules` | `FormRules`（字段名 → 校验函数数组） | `{}` | 校验规则：函数返回 true（通过）/ 错误文案（失败）/ Promise（异步）；字段内按序取首个失败文案，字段间并行。 |
| `pending` | `boolean` | `false` | 异步提交进行中（受控）：true 时拦截提交（不校验、不 emit submit），并并入插槽作用域 pending。 |

## Form Events / Slots / Exposes

**Events**

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `submit` | `SubmitEvent` | 提交：仅当全量校验通过且非 pending 时触发；原生 submit 已 preventDefault（不会引发浏览器原生提交/刷新）。 |

**Slots**

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `default` | `{ valid: boolean, pending: boolean, errors: Readonly<FormErrors> }` | 表单内容（通常为若干 FormField + 提交 Button）。valid=当前无校验错误；pending=异步校验中或 pending prop；errors=字段名→文案的浅拷贝。 |

**Exposes**

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `validate` | `() => Promise<FormErrors>` | 主动触发全量校验：更新内部 errors（同步驱动 FormField 展示）并返回错误集合，空对象即全部通过。 |
| `resetValidation` | `() => void` | 清空全部校验错误（不改 model 值）。 |

## FormField Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name`（必填） | `string` | — | 字段名：对应 Form 的 model 键与 rules 键，用于读取注入的校验错误。 |
| `label` | `string` | — | 标签文本：渲染为 `label[for=控件 id]`；不传则不渲染 label。 |
| `required` | `boolean` | `false` | 必填标记：label 后红色 *（aria-hidden 纯视觉），controlAttrs 附带 `aria-required="true"`。 |
| `error` | `string` | — | 错误文案：优先于 Form 注入的校验错误，空串视为无错误；无 Form 时独立展示。 |
| `help` | `string` | — | 帮助文案：无错误时展示于控件下方（aria-describedby 指向）；出现错误时让位。 |

## FormField Slots

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `default` | `{ id: string, invalid: boolean, controlAttrs: FormControlAttrs }` | 表单控件；将 controlAttrs 直接 v-bind 到控件（或用 id/invalid 自行绑定），完成 label 关联与 aria 落位。 |
| `error` | `{ error: string }` | 错误文案内容；覆盖 error prop 的文本渲染（作用于错误文案元素内）。 |

## 可访问性

- Form：原生 `<form novalidate>`（自定义校验，关闭原生约束校验双轨）；Enter 隐式提交等键盘路径走浏览器原生行为；提交语义统一收敛到原生 submit 事件。提交按钮用 `type="submit"` 以获得原生 Enter 隐式提交路径。
- FormField：`label[for]` 与控件 id 严格关联（id = 固定前缀 + Vue useId，SSR 稳定且各字段唯一）；错误时 controlAttrs 提供 `aria-invalid="true"`，aria-describedby 指向错误文案元素 id；无错误有 help 时指向 help 元素 id；required 提供 `aria-required="true"`。
- FormField 文案元素为 `<p>`（不使用 role="alert"，避免多字段同时失败时重复打断朗读；状态变化经 aria-invalid 与描述关联传达）。
- 校验文案要可行动（说明如何修正），不要只写「格式错误」。

## SSR 行为

Form：`renderToString` 无异常（setup 与模块顶层不访问任何浏览器 API）；作用域 `{ valid, pending, errors }` 初始值（true/false/{}）随 SSR 输出。FormField：控件 id 由 Vue useId 生成（SSR/hydration 一致），label[for]、错误/帮助文案 id 与 controlAttrs 均随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Form, FormField, Input, Button } from '@ui/components'
import type { FormRules } from '@ui/components'

const form = reactive({ title: '' })
const saving = ref(false)

const rules: FormRules = {
  title: [(v) => (String(v).trim() ? true : '请输入标题')],
}

async function save() {
  saving.value = true
  // …异步提交
  saving.value = false
}
</script>

<template>
  <Form :model="form" :rules="rules" :pending="saving" @submit="save">
    <FormField name="title" label="标题" required>
      <template #default="{ controlAttrs }">
        <Input v-bind="controlAttrs" v-model="form.title" />
      </template>
    </FormField>
    <template #default="{ pending }">
      <Button type="submit" variant="primary" :loading="pending">保存</Button>
    </template>
  </Form>
</template>
```
