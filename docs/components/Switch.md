# Switch

> 纸面开关：button[role=switch] + aria-checked 的即时生效控件，loading（aria-busy + 拦截切换、保持可聚焦）、disabled、sm/md 两档尺寸，选中转 accent 底 on-accent 圆点。

- **导出名**：`Switch`（`@ui/components`）· id `ui-switch` · 产品族 Inputs
- **契约来源**：`packages/components/src/switch/Switch.meta.ts` / `Switch.types.ts` / `Switch.vue`

## 是什么

表达「开/关」双态且切换即时生效的控件：受控 `v-model`(boolean)、loading 异步护栏、禁用与可读名称；一次点击立即改变状态。用户需要立刻开启或关闭某个功能，并看到当前处于哪一态。

## 何时用

- 设置项的即时生效开关（通知、免打扰、自动保存等，无需提交按钮）
- 切换后立即触发副作用的场景（配 loading 表达进行中的异步）
- 两态且结果立即可见的功能启用/停用

## 何时不该用

- 勾选语义（多选、批量选择、随表单提交）用 **Checkbox**：即时生效用 Switch，勾选用 Checkbox——Switch 表达状态开关，Checkbox 表达选中集合
- 多选一用 **Radio**/**RadioGroup**：Switch 只有两态
- 需要点「保存」才生效的偏好设置用 Checkbox/表单 + Button，不要用 Switch
- 触发一次动作（如「立即同步」）用 **Button**：Switch 表达持续状态，不是动作按钮

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | v-model 绑定值；受控，点击/键盘激活后以 !modelValue 发出 update:modelValue。 |
| `loading` | `boolean` | `false` | 加载中：置 `aria-busy="true"`、圆点让位旋转指示，点击与键盘激活一律不切换；保持可聚焦（不落原生 disabled）。 |
| `disabled` | `boolean` | `false` | 禁用：原生 disabled 属性（移出 Tab 序），一切切换路径无效。 |
| `label` | `string` | — | 可读名称；与默认插槽等价，插槽优先（根为 label 元素，点击文本即切换）。 |
| `size` | `'sm' \| 'md'` | `'md'` | 尺寸档位：sm（32×20）/ md（40×24），轨道与圆点尺寸全部由 `--ui-space-*` token 推导。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `boolean` | v-model 更新：仅非 disabled 且非 loading 时发出，载荷为切换后的布尔值。 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 可读名称内容（优先于 label prop）；也可承载带辅助说明的富文本。 |

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `(options?: FocusOptions) => void` | 聚焦开关按钮（仅客户端有意义）。 |
| `blur` | `() => void` | 移除焦点。 |

## 可访问性

- 原生 `<button type="button">` 承载 `role="switch"`（恒定）与 `aria-checked="true"/"false"`（常驻，不缺省）；键盘 100% 原生：Tab 进入、Enter/Space 激活（浏览器原生 click 路径，组件不绑定 keydown、不改写 tabindex）。
- loading 置 `aria-busy="true"` 且不落 disabled（读屏可聚焦感知）；disabled 用原生 disabled 而非 aria-disabled；旋转指示 svg aria-hidden。
- 根为 label 元素，点击文本即切换；无 label 时必须经 attrs 提供 aria-label（attrs 直达 button）。
- 异步切换：点击 → 置 loading → 完成后回写 modelValue，不要在 loading 中连续派发。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；focus()/blur() 仅客户端暴露方法内。role="switch"、aria-checked、aria-busy（loading 时）、disabled、尺寸类与 label 均随 SSR 输出；loading 指示为纯 CSS 动画，SSR 只输出静态 svg。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@ui/components'

const enabled = ref(false)
</script>

<template>
  <Switch v-model="enabled" label="消息通知" />
</template>
```
