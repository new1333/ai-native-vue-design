# Select

> 纸面单选下拉：combobox 触发器 + Teleport 弹层 listbox（aria-activedescendant 焦点模型），受控 v-model(string|number|null)、清空按钮与空态文案。

- **导出名**：`Select`（`@ui/components`）· id `ui-select` · 产品族 Inputs
- **契约来源**：`packages/components/src/select/Select.meta.ts` / `Select.types.ts` / `Select.vue`

## 是什么

从有限候选项中单选一个值：受控 v-model、键盘/指针双路径、可清空、空态兜底文案；选项为 `{label, value, disabled?}[]`。用户需要从候选列表中选定（或清空）一个值，并能用键盘完成全程操作。

## 何时用

- 表单中从枚举值里选一项（状态、分类、负责人等）
- 候选项需要禁用个别选项（disabled）
- 需要一键清空已选值回到占位态（clearable）
- 选项较多需要键盘导航（↓/↑/Home/End/Enter/Esc）快速定位
- 选项为空/加载中时需要兜底文案（emptyText）

## 何时不该用

- 自由文本输入用 **Input**：Select 只能从给定选项中选择
- 多选场景用多选组件：Select 严格单选
- 选项需要分组/搜索过滤的复杂场景：当前版本不提供分组与过滤
- 开/关语义用 **Switch**：Select 不是开关
- 执行动作且无需回显选中态的菜单用 **DropdownMenu**

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `SelectValue \| null`（string \| number \| null） | `null` | v-model 绑定值；受控，以 === 匹配选项 value，null 表示未选（清空后以 null 更新）。 |
| `options` | `SelectOption[]`（`{label: string; value: SelectValue; disabled?: boolean}`） | `[]` | 选项全集；value 应唯一，disabled 项不可被高亮/选中。 |
| `placeholder` | `string` | `'请选择'` | 占位文本（无已选值时显示在触发器内）；不替代 label。 |
| `emptyText` | `string` | `'暂无选项'` | 空态文案：options 为空数组时弹层内显示。 |
| `disabled` | `boolean` | `false` | 禁用：触发器原生 disabled（移出 Tab 序）+ 拦截开合/键盘 + 不渲染清空按钮。 |
| `clearable` | `boolean` | `false` | 可清空：有已选值且非禁用时渲染清空按钮（aria-label="清空"，与折叠箭标互换显示）。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `SelectValue \| null` | v-model 更新：选项选中（载荷为选项 value）或清空（载荷为 null）。 |
| `clear` | — | 点击清空按钮后触发（值已随 update:modelValue 置 null，随后焦点交还触发器）。 |

## Slots

无。触发器与弹层内容均由 props 驱动渲染。

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `(options?: FocusOptions) => void` | 聚焦触发器按钮（仅客户端有意义）。 |
| `blur` | `() => void` | 移除焦点（触发器 blur 会关闭已打开的弹层）。 |

## 可访问性

- 触发器为原生 `<button type="button" role="combobox">`，携带 `aria-haspopup="listbox"`、aria-expanded、aria-controls（指向弹层 id）与 aria-activedescendant（打开且有高亮时指向选项 id，否则不出现）。
- 弹层 `role="listbox"`，选项 `role="option"` + aria-selected，禁用项 `aria-disabled="true"`。
- 焦点模型：焦点始终停留在触发器，选项不进 Tab 序；键盘 ↓/↑ 移动高亮（跳过禁用项）、Home/End 首尾、Enter/Space 打开或选中、Esc 关闭；受理键一律 preventDefault（含 Space 滚动与原生 button 二次激活）。
- Tab 离开（触发器 blur）与点击外部均关闭弹层；清空按钮为原生 button、`aria-label="清空"`，点击后焦点交还触发器；disabled 用原生 disabled。
- label 由 FormField 提供，勿以 placeholder 替代；未内建错误态，由使用方以 attrs（aria-describedby）配合 FormField 呈现。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；弹层由 mounted 门控（Teleport 仅客户端渲染），SSR 输出只有触发器（含 role/aria-expanded/aria-controls 与 placeholder/已选 label），不出现 listbox/option。document 点击外部关闭监听只在 onMounted 注册、onBeforeUnmount 移除；弹层定位（getBoundingClientRect）只在打开后的 nextTick 内执行。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@ui/components'

const status = ref<string | null>(null)
const options = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
]
</script>

<template>
  <Select v-model="status" :options="options" clearable />
</template>
```
