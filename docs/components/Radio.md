# Radio

> 纸面单选组：RadioGroup 容器（受控 modelValue + 必填 name + 整组 disabled，provide/inject 下发组内 Radio）+ Radio 单选项（原生 input[type=radio]，键盘行为全原生）。

- **导出名**：`Radio`、`RadioGroup`（`@ui/components`）· id `ui-radio` / `ui-radio-group` · 产品族 Inputs
- **契约来源**：`packages/components/src/radio/Radio.meta.ts` / `RadioGroup.meta.ts` / `Radio.types.ts` / `Radio.vue` / `RadioGroup.vue`

## 是什么

**RadioGroup** 管理一组互斥单选：受控选中值、原生 name 分组与整组禁用，经 provide/inject 驱动组内 Radio。**Radio** 是互斥单选组中的一个选项：value + 可读 label，选中态由所在组的受控值派生。用户需要在一组互斥选项中选中恰好一个，键盘方向键即可在选项间移动。

## 何时用（RadioGroup）

- 多个互斥选项中恰好选一个（配送方式、可见范围、排序策略等）
- 选项少于 5 个、无需搜索的场景（更多用 Select）
- 需要整组禁用或随表单提交单一值

## 何时不该用（RadioGroup）

- 可多选（含全不选）用 **Checkbox**：radio 互斥且必有选中
- 开关/即时切换语义用 **Switch**：RadioGroup 表达「多选一」而非状态切换
- 选项很多或需输入过滤时用 **Select**
- 不含 Radio 的静态分组用 fieldset/列表容器，不要套 radiogroup

**Radio 边界**：必须包在 RadioGroup 内使用（脱离组则无 name 分组，原生互斥与方向键导航失效）；独立开关语义请用 Switch/Checkbox。

## RadioGroup Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `undefined` | v-model 当前选中值（受控）；未选中为 undefined，选中某项后由 Radio 的 change 路径更新。 |
| `name`（必填） | `string` | — | 原生 name（必填）：同组 radio 互斥与方向键导航的分组依据，务必保持组内唯一语义。 |
| `disabled` | `boolean` | `false` | 整组禁用：组内全部 Radio 原生 disabled（移出 Tab 序）。 |

## RadioGroup Events / Slots

**Events**

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `string \| number` | 组内任一 Radio 原生 change 时发出，载荷为该 Radio 的 value。 |

**Slots**

| 插槽 | 说明 |
| --- | --- |
| `default` | 组内放置若干 Radio（渲染序即原生 Tab 序与方向键导航序）。 |

## Radio Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value`（必填） | `string \| number` | — | 该选项对应的值（必填）；change 时经 RadioGroup 以 update:modelValue 发出。 |
| `label` | `string` | — | 可读名称；与默认插槽等价，插槽优先。 |
| `disabled` | `boolean` | `false` | 单项禁用（与组 disabled 取或）：原生 disabled 属性。 |

## Radio Events / Slots / Exposes

**Events**：`change`（载荷 `Event`）——原生 change 事件（经组件转发到组的选中路径；一般无需直接监听，改用 RadioGroup 的 update:modelValue）。

**Slots**

| 插槽 | 说明 |
| --- | --- |
| `default` | label 内容（优先于 label prop）；点击文本即选中（根为 label 元素）。 |

**Exposes**：`focus(options?: FocusOptions)`（聚焦原生 radio）、`blur()`（移除焦点）——均仅客户端有意义。

## 可访问性

- RadioGroup 容器 `role="radiogroup"`（attrs 的 aria-label 等落在容器）；选项为原生 `<input type="radio">`：checked/disabled 原生表达，不使用 aria-checked。
- 键盘 100% 原生：Tab 进入组、方向键在同名 radio 间移动并选中、Space 选中——组件不绑定 keydown、不改写 tabindex；焦点环由全局 `:focus-visible` 约定提供。
- Radio 根为 label 元素，点击文本即选中；圆点为纯装饰（aria-hidden），不进入可读内容。
- value 必须组内唯一；label prop 或插槽必须提供其一，否则读屏无可读名称；不要给 Radio 单独传 name（组统一下发）。

## SSR 行为

`renderToString` 无异常：provide/inject 在 SSR 渲染期即生效（选中态随组受控值输出 checked 属性）；name / disabled / label 均随 SSR 输出；不访问任何浏览器 API，focus()/blur() 仅客户端暴露方法。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup, Radio } from '@ui/components'

const plan = ref('free')
</script>

<template>
  <RadioGroup v-model="plan" name="plan" aria-label="套餐">
    <Radio value="free" label="免费版" />
    <Radio value="pro" label="专业版" />
  </RadioGroup>
</template>
```
