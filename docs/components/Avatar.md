# Avatar

> 纸面头像：src 图片 + 加载失败/缺省回退首字母（initials 优先，否则由 name 推导），全圆三档尺寸（24/32/40），alt 必填保证可读名称。

- **导出名**：`Avatar`（`@ui/components`）· id `ui-avatar` · 产品族 Foundations
- **契约来源**：`packages/components/src/avatar/Avatar.meta.ts` / `Avatar.types.ts` / `Avatar.vue`

## 是什么

以图片或首字母呈现一个人/团队/实体的身份标识：全圆小尺寸、必有可读名称（alt）、图片失败自动回退首字母。用户需要快速识别一条内容归属的人或实体。

## 何时用

- 导航栏/评论/表格行的用户身份标识
- 协作成员列表、消息发送者标识
- 团队/组织等实体的图形标识（配图标图片）
- 无图片时以首字母占位（initials 或由 name 推导）

## 何时不该用

- 可点击跳转到个人页的入口应外层包 `a`/`RouterLink`：Avatar 自身非交互
- 状态在线/离线标记需要叠加 **Badge**：Avatar 不承载状态语义
- 品牌 logo 等矩形展示图直接用 `img`：Avatar 强制全圆裁剪
- 替代用户名文本：Avatar 是图形补充，名字仍需文本呈现

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | — | 图片地址：有效且未加载失败时渲染 `<img>`；缺省、空串或 onerror 后回退首字母。 |
| `alt`（必填） | `string` | — | 替代文本（必填）：随 `<img alt>` 输出；回退态作为根元素 `role="img"` 的 aria-label。 |
| `name` | `string` | — | 名称：未显式给 initials 时按首个/末个空白分隔词的首字符推导回退首字母（大写）。 |
| `initials` | `string` | — | 显式回退首字母，优先于 name 推导。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸档位：sm 24px / md 32px / lg 40px；字号档随尺寸 12/13/15。 |

## Events

无。Avatar 为纯展示组件，不发出任何事件。

## Slots

无。内容只来自 `src` / `initials` / `name`。

## 可访问性

- 图片态由 `<img alt>`（必填）提供可读名称；回退态根元素 `role="img"` + aria-label（同 alt），首字母文本 `aria-hidden="true"` 不重复播报。
- 组件自身非交互：无 tabindex、不捕获焦点、不参与 Tab 序；外层为链接时焦点环由外层 `:focus-visible` 提供。
- 首字母是装饰性视觉，语义一律来自 alt；alt 填人名/团队名等可读名称，勿填「头像」这类泛称。
- 图片加载失败自动回退；src 更新会自动重试新图，无需手动复位。

## SSR 行为

`renderToString` 无异常：setup 与模块顶层不访问任何浏览器 API；图片失败监听经模板 `@error` 挂载（服务端不触发、不序列化）；src/alt/尺寸类/回退首字母均随 SSR 输出。

## 最小用例

```vue
<script setup lang="ts">
import { Avatar } from '@ui/components'
</script>

<template>
  <Avatar src="/u/zhang.png" alt="张三" name="张三" />
</template>
```
