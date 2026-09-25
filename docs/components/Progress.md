# Progress

> 纸面进度条：确定进度（value 0-100 + aria-valuenow）与不确定进度（indeterminate 扫描，reduced-motion 降级静态半填充），accent 填充 + muted 轨道。

- **导出名**：`Progress`（`@ui/components`）· id `ui-progress` · 产品族 Data
- **契约来源**：`packages/components/src/progress/Progress.meta.ts` / `Progress.types.ts` / `Progress.vue`

## 是什么

任务/加载的进度反馈：确定态按 value 0-100 填充并可显示数值标签；不确定态以扫描动画表达「进行中但进度未知」。用户需要感知某个过程进行到什么程度，或确认过程仍在进行。

## 何时用

- 上传/下载、安装、批处理等可计算进度的任务（value + showLabel）
- 耗时未知但正在进行的过程（indeterminate）
- 分步向导的整体完成度展示

## 何时不该用

- 未知时长的版面等待用 **Skeleton**：Progress 表达进度而非占位结构
- 可操作的控制条（音量/播放进度）需要交互语义，非只读 progressbar
- 操作结果反馈用 **Toast** / **Alert**：Progress 表达「进行中」
- 离散步骤的当前位置用 Steps：Progress 表达连续进度

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 确定进度值 0-100：越界钳制到 [0,100]、非有限数回退 0；透传为 aria-valuenow 与填充宽度；indeterminate=true 时忽略。 |
| `indeterminate` | `boolean` | `false` | 不确定进度：忽略 value、省略 aria-valuenow（进度未知）、填充转扫描动画；prefers-reduced-motion 时降级为静态 50% 半填充。 |
| `showLabel` | `boolean` | `false` | 显示数值标签（如 "42%"，tabular-nums）；仅确定进度渲染，indeterminate 无确定值不渲染。 |
| `size` | `'sm' \| 'md'` | `'md'` | 条高档位：sm 4px、md 8px（`--ui-space-1`/`--ui-space-2`）。 |

## Events / Slots / Exposes

无。Progress 为非交互只读展示组件：无 emits、无 slots、无 exposes。任务名称（aria-label/aria-labelledby）由使用方提供。

## 可访问性

- 根元素 `role="progressbar"`：`aria-valuemin="0"`/`aria-valuemax="100"` 恒在，确定态 `aria-valuenow`=钳制后的 value；indeterminate 按 WAI-ARIA 省略 aria-valuenow（进度未知）。
- `showLabel` 以 "42%" 文本提供视觉双通道；非交互、无 tabindex、永不获得焦点环。
- 能拿到确定进度时始终用 value（读屏依赖 aria-valuenow），indeterminate 仅作兜底；需要可读名称时由使用方以 aria-label/aria-labelledby 指向任务说明。

## SSR 行为

`renderToString` 无异常：组件不访问任何浏览器 API（无 effect/监听/测量），role/aria 值、修饰类、内联填充宽度与标签文本均在服务端输出；indeterminate 态 SSR 即省略 aria-valuenow。

## 最小用例

```vue
<script setup lang="ts">
import { Progress } from '@ui/components'
</script>

<template>
  <div role="status" aria-label="上传中">
    <Progress :value="42" show-label />
  </div>
</template>
```
