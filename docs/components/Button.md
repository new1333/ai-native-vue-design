# Button

> 纸面按钮：承载一次即时动作的原生 button，四档视觉（primary/secondary/ghost/danger）、三档尺寸，含 loading/disabled 语义。

- **导出名**：`Button`、`ButtonGroup`（`@ui/components`）· id `ui-button` / `ui-button-group` · 产品族 Foundations
- **契约来源**：`packages/components/src/button/Button.meta.ts` / `ButtonGroup.meta.ts` / `Button.types.ts` / `ButtonGroup.types.ts` / `Button.vue` / `ButtonGroup.vue`

## 是什么

触发一次即时动作（提交、保存、取消、删除等）的按钮，视觉与交互语义齐全；`ButtonGroup` 把若干相关 Button 连排成一组（共享 size、首尾圆角、`role="group"`）。目录内另有 `ButtonRoot`（无样式交互根，配合 `useButton` 供深度定制），为公共导出但常规使用无需接触。

## 何时用（Button）

- 表单提交 / 保存 / 取消等即时动作
- 对话框、卡片、工具栏中的确认与操作入口
- 需要 loading 挡截重复点击的异步动作
- 危险操作（删除、注销）用 `variant="danger"`

## 何时不该用（Button）

- 仅图标、无文本的动作用 **IconButton**：默认插槽应始终有可读文本 label，不要清空文本只留 icon 插槽
- 站内导航或外链用 `<a>`/`<RouterLink>`：Button 不渲染 href，没有导航语义，链接应保持中键新开、右键菜单等原生行为
- 开/关或选中状态的持续表达用 **Switch**/**Checkbox**/**Radio**：Button 表达即时动作，不承载选中态
- 只读信息展示或富内容排版用 Typography/Card 类组件，不要用按钮包裹

## Button Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'secondary'` | 视觉档位：primary 实底强调、secondary 描边常规、ghost 无底安静、danger 危险操作（柔底，hover 转实底）。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸档位；ButtonGroup 内未显式声明时跟随组 size。 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生 button type；表单提交需显式传 `"submit"`。 |
| `loading` | `boolean` | `false` | 加载中：显示旋转指示、置 `aria-busy="true"`，点击与 Enter/Space 激活一律不触发 click，但保持可聚焦。 |
| `disabled` | `boolean` | `false` | 禁用：原生 disabled 属性（移出 Tab 序）+ 拦截一切激活路径。 |
| `block` | `boolean` | `false` | 块级铺满容器宽度。 |

## Button Events / Slots / Exposes

**Events**

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `click` | `MouseEvent` | 点击激活；仅在非 disabled/loading 时触发，键盘 Enter/Space 激活走同一路径。 |

**Slots**

| 插槽 | 说明 |
| --- | --- |
| `default` | 按钮文本/内容；应始终提供可读 label（图标化操作改用 IconButton）。 |
| `icon` | 左侧图标；传内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor），尺寸由组件按 size 统一约束为 16/20/24。loading 时让位于加载指示。 |
| `iconRight` | 右侧图标，约束同 icon。 |

**Exposes**

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `(options?: FocusOptions) => void` | 聚焦根按钮元素（仅客户端有意义）。 |
| `blur` | `() => void` | 移除焦点。 |

## ButtonGroup

把若干相关 Button 连排成一组：视觉上无缝相接、尺寸统一、语义上归为一个 group。适用于同一操作的多个并列分支（复制/编辑/删除）、工具栏、表格行尾动作列。不要用于：分段选择/单选（选中态语义应使用专用选择组件）；主操作 + 次操作的对话框动作区（直接并排两个 Button 即可）；仅一个按钮时无需包裹。

**Props**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | — | 组内共享尺寸；组内 Button 显式声明 size 时以自身为准。 |

**Slots**

| 插槽 | 说明 |
| --- | --- |
| `default` | 组内容，通常为若干 Button（**直接 DOM 子元素**才能享受首尾圆角处理）。 |

容器 `role="group"`，可用 aria-label（透传 attrs）命名分组；组内 Button 不单独声明 size，统一交给 ButtonGroup。

## 可访问性

- 原生 `<button>`（隐式 role=button），Tab 自然进入/移出，Enter/Space 激活；keydown 阶段统一 preventDefault 后由元素 `.click()` 触发，保证各环境单次激活且 Space 不滚动页面。
- loading 时 `aria-busy="true"` 且不置 disabled（保持焦点与读屏可达）；disabled 用原生 disabled 而非 aria-disabled。加载指示 svg `aria-hidden="true"`。
- 焦点环由全局 `:focus-visible` 约定提供（2px `--ui-accent` 实线 + 2px 偏移，paper.css）；组件不改写 outline、不改 tabindex。
- 一屏 primary 强调动作 ≤1；危险动作用 danger 且需二次确认。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；`.click()`/`focus()` 仅出现在客户端事件回调与暴露方法内；aria-busy、disabled、type 均随 SSR 输出。ButtonGroup 的 size 共享走 provide/inject，SSR 期间即可解析。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, ButtonGroup } from '@ui/components'

const saving = ref(false)
async function submit() {
  saving.value = true
  // …异步保存
  saving.value = false
}
</script>

<template>
  <Button variant="primary" :loading="saving" @click="submit">保存</Button>

  <ButtonGroup size="sm" aria-label="行操作">
    <Button>复制</Button>
    <Button>编辑</Button>
    <Button variant="danger">删除</Button>
  </ButtonGroup>
</template>
```
