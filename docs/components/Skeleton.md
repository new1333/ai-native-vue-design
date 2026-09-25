# Skeleton

> 纸面骨架占位：内容加载前的 line/circle/rect 形状占位（muted 面 + opacity shimmer），纯装饰 aria-hidden，加载状态由使用方容器声明。

- **导出名**：`Skeleton`（`@ui/components`）· id `ui-skeleton` · 产品族 Data
- **契约来源**：`packages/components/src/skeleton/Skeleton.meta.ts` / `Skeleton.types.ts` / `Skeleton.vue`

## 是什么

加载中的形状占位：多行文本（line，可配行数与末行短尾）、正圆（circle）、矩形（rect），以 opacity 呼吸表达「正在加载」。用户在内容加载期间需要看到版面结构已就位的视觉反馈。

## 何时用

- 列表/卡片/详情页数据请求期间的版面占位，减少布局抖动
- 头像/媒体等已知形状的局部占位（`variant="circle"`/`"rect"`）
- 多行文本区块占位（`variant="line"` + lines，末行短尾模拟段落收尾）

## 何时不该用

- 已知进度的任务用 **Progress**：Skeleton 表达「未知时长的等待」，不表达进度
- 操作反馈/结果提示用 **Toast** / **Alert**：Skeleton 不是反馈通道
- 空数据状态用 **EmptyState**：Skeleton 只服务「加载中」
- 不要用 Skeleton 承载可读文本或可交互元素（本体 aria-hidden）

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'line' \| 'circle' \| 'rect'` | `'line'` | 骨架形状：line 多行文本占位（配 lines）、circle 正圆（头像）、rect 矩形（块面/媒体）。圆角随形状：line/rect 用 radius-sm，circle 全圆。 |
| `lines` | `number` | `3` | variant="line" 的行数：最小 1（0/负数回退 1）、小数向下取整；末行渲染短尾（max-width 60%）。其余形状忽略。 |
| `width` | `string \| number` | — | 宽度：数字按 px，字符串原样（如 "50%"）；三种形状均生效，circle 时优先作为正圆直径。 |
| `height` | `string \| number` | — | 高度：数字按 px，字符串原样；line 时为每行行高，rect 直接生效，circle 时仅在缺 width 时作为直径。 |

## Events / Slots / Exposes

无。Skeleton 为纯装饰组件：无 emits、无 slots、无 exposes。

## 可访问性

- 纯装饰元素：根节点恒 `aria-hidden="true"`，不书写 role/tabindex、不产生可读文本；组件不可聚焦、不进入 Tab 序。
- 读屏用户对加载状态的感知完全依赖使用方容器（如 `role="status"` + aria-live、`aria-busy="true"`）——**始终由使用方包裹并声明加载状态**。
- 形状/尺寸尽量贴近真实内容，减少加载完成后的布局跳动。

## SSR 行为

`renderToString` 无异常：组件不访问任何浏览器 API（无 effect/监听/测量/定时器），形状类名、行数、末行短尾类、内联宽高与 aria-hidden 均在服务端输出，无客户端 hydration 分支。

## 最小用例

```vue
<script setup lang="ts">
import { Skeleton } from '@ui/components'
</script>

<template>
  <div role="status" aria-label="加载中">
    <Skeleton :lines="3" />
  </div>
</template>
```
