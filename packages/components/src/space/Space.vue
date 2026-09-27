<script setup lang="ts">
/**
 * Space —— 间距容器：横向/纵向 flex 排列，子元素间距由 flex gap 承担（token-only）。
 *
 * - 根元素为单一 <div>（模板根层级不得插入注释，否则成为 fragment、attrs 透传失效）。
 * - 间距档位 size（sm/md/lg）经修饰类映射 --ui-space-2/--ui-space-4/--ui-space-6 写入 flex gap；
 *   方向（row/column）、换行（wrap）、对齐（align）同为修饰类，不做行内样式。
 * - 纯布局容器：无 role/aria-*、不可聚焦、无 emits、无副作用；子元素由默认插槽直出
 *   （不加逐子元素包裹层；flex 布局规范不渲染纯空白匿名盒，模板换行不产生额外间隔）。
 * - setup 与模块顶层不访问任何浏览器 API，node 环境 renderToString 无异常。
 * - 一切间距均消费 var(--ui-*) token（paper.css）；无颜色/字号/阴影声明。
 */
import { computed } from 'vue'
import { SPACE_ALIGN_DEFAULT, SPACE_DIRECTION_DEFAULT, SPACE_SIZE_DEFAULT } from './Space.constants'
import type { SpaceProps, SpaceSlots } from './Space.types'

const props = withDefaults(defineProps<SpaceProps>(), {
  direction: SPACE_DIRECTION_DEFAULT,
  size: SPACE_SIZE_DEFAULT,
  wrap: false,
  align: SPACE_ALIGN_DEFAULT,
})
defineSlots<SpaceSlots>()

/** 根类：ui-space 基类 + 方向/档位/对齐/换行修饰类。 */
const rootClasses = computed(() => [
  'ui-space',
  `ui-space--${props.direction}`,
  `ui-space--${props.size}`,
  `ui-space--align-${props.align}`,
  {
    'ui-space--wrap': props.wrap,
  },
])
</script>

<template>
  <div :class="rootClasses">
    <slot />
  </div>
</template>

<style scoped>
/* ── 基底：inline-flex 收缩至内容宽度，间距全权交给 flex gap ──────────── */
.ui-space {
  display: inline-flex;
}

/* ── 方向（结构性关键字，非视觉取值）─────────────────────────────────── */
.ui-space--row {
  flex-direction: row;
}

.ui-space--column {
  flex-direction: column;
}

/* ── 间距档位：sm/md/lg 映射 --ui-space-2/--ui-space-4/--ui-space-6 ──── */
.ui-space--sm {
  gap: var(--ui-space-2);
}

.ui-space--md {
  gap: var(--ui-space-4);
}

.ui-space--lg {
  gap: var(--ui-space-6);
}

/* ── 换行 ────────────────────────────────────────────────────────────── */
.ui-space--wrap {
  flex-wrap: wrap;
}

/* ── 交叉轴对齐（结构性关键字，非视觉取值）───────────────────────────── */
.ui-space--align-start {
  align-items: flex-start;
}

.ui-space--align-center {
  align-items: center;
}

.ui-space--align-end {
  align-items: flex-end;
}

.ui-space--align-baseline {
  align-items: baseline;
}

.ui-space--align-stretch {
  align-items: stretch;
}
</style>
