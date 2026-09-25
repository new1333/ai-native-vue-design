# IconButton

> 纸面仅图标按钮：单一图标触发的即时动作按钮，复用 Button 系交互语义（ButtonRoot/useButton），三档视觉（ghost/outline/primary）、三档尺寸（图标 16/20/24），含 loading/disabled。

- **导出名**：`IconButton`（`@ui/components`）· id `ui-icon-button` · 产品族 Foundations
- **契约来源**：`packages/components/src/icon-button/IconButton.meta.ts` / `IconButton.types.ts` / `IconButton.vue`

## 是什么

以单个内联 SVG 图标为全部内容的动作按钮，承载一次即时动作的触发。用户需要通过一个约定俗成的图标，触发一个即时动作。

## 何时用

- 工具栏 / 表格行 / 卡片角落的空间受限动作（编辑、复制、删除、收起）
- 对话框、抽屉、标签页的关闭（关闭等约定图标 + aria-label）
- 折叠/展开、播放/暂停等图标语义强、约定俗成的动作
- 与 Button 混排的工具条（同尺寸档图标 16/20/24 对齐 Button sm/md/lg）

## 何时不该用

- 动作能用文本表达时一律用 **Button**：IconButton 无可读文本，可发现性与可读性更差，icon-only 不是默认选择
- 站内导航或外链用 `<a>`/`<RouterLink>`：IconButton 不渲染 href，没有链接语义
- 开/关或选中状态的持续表达用 **Switch**/**Checkbox**/**Radio**：IconButton 表达即时动作，不承载选中态
- 需要图标 + 文本组合的按钮用 Button 的 `#icon`/`#iconRight` 插槽，不要用 IconButton 塞文本

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'ghost' \| 'outline' \| 'primary'` | `'ghost'` | 视觉档位：ghost 无底安静（工具栏默认）、outline 描边常规、primary accent 实底强调。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸档位，映射图标渲染尺寸 sm=16 / md=20 / lg=24（与 Button 三档对齐）。 |
| `loading` | `boolean` | `false` | 加载中：图标让位于旋转指示、置 `aria-busy="true"`，点击与 Enter/Space 激活一律不触发 click，保持可聚焦（同 Button）。 |
| `disabled` | `boolean` | `false` | 禁用：原生 disabled 属性（移出 Tab 序）+ 拦截一切激活路径。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `click` | `MouseEvent` | 点击激活；仅在非 disabled/loading 时触发，键盘 Enter/Space 激活走同一路径。 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 图标内容：仅内联 SVG（viewBox="0 0 24 24"、stroke-width 1.5、currentColor），渲染尺寸由组件按 size 统一约束为 16/20/24；loading 时让位于加载指示。 |

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `(options?: FocusOptions) => void` | 聚焦根按钮元素（仅客户端有意义）。 |
| `blur` | `() => void` | 移除焦点。 |

## 硬性要求

必须提供 `aria-label` 或 `aria-labelledby`（经 attrs 透传到根 button），两者皆缺时开发环境 `console.warn`。

## 可访问性

- 原生 `<button>`（隐式 role=button），可访问名完全依赖 aria-label / aria-labelledby；约定图标（如 ×）也写明动作（「关闭」）而非形状（「叉号」）。
- Tab 自然进入/移出，Enter/Space 激活（keydown 统一 preventDefault 后由元素 `.click()` 单次触发，复用 useButton 策略）。
- loading 时 `aria-busy="true"` 且不置 disabled（保持焦点与读屏可达）；disabled 用原生 disabled。加载指示 svg aria-hidden。
- 焦点环由全局 `:focus-visible` 约定提供；图标颜色一律 currentColor，随档位态变色。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API（aria-label 检查只读 attrs，console.warn 在服务端同样安全）；`.click()`/`focus()` 仅出现在客户端事件回调与暴露方法内；aria-busy、disabled、图标 SVG 均随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { IconButton } from '@ui/components'
</script>

<template>
  <IconButton aria-label="关闭" @click="close">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <!-- × 图标路径 -->
    </svg>
  </IconButton>
</template>
```
