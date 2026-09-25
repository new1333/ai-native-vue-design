<script setup lang="ts">
/**
 * Divider —— 分隔线组件：方向（水平/垂直）+ 可选居中标签（token-only）。
 *
 * - direction="horizontal" 且未提供 label 插槽：渲染语义 <hr>（隐式 separator role）。
 * - direction="horizontal" 且提供 label 插槽：渲染 div[role="separator"]，标签居中、两侧细线
 *   （<hr> 为 void 元素无法承载内容，故此形态改用带 role 的 div）。
 * - direction="vertical"：渲染 div[role="separator"][aria-orientation="vertical"]，label 插槽不生效。
 * - 根元素为单一动态标签（<component :is>，模板根层级不得插入注释，否则成为 fragment、
 *   attrs 透传失效）；细线颜色走 --ui-border、间距走 --ui-space-*；纯展示、无交互、不可聚焦。
 * - 一切颜色、字号、间距均消费 var(--ui-*) token（paper.css）。
 */
import { useSlots } from 'vue'
import { DIVIDER_DIRECTION_DEFAULT } from './Divider.constants'
import type { DividerProps, DividerSlots } from './Divider.types'

const props = withDefaults(defineProps<DividerProps>(), {
  direction: DIVIDER_DIRECTION_DEFAULT,
})
defineSlots<DividerSlots>()

const slots = useSlots()

/**
 * 是否提供标签插槽。刻意用普通函数在每次模板渲染时求值，而不用 computed：
 * slots 对象非响应式（computed 会缓存过期值），父组件动态增删 label 插槽时，
 * 子组件被强制重渲染，函数式求值才能即时反映形态切换（hr ↔ div）。
 */
const hasLabel = (): boolean => Boolean(slots.label)

/** 水平形态：语义 hr（无标签）。 */
const isHorizontalRule = (): boolean => props.direction === 'horizontal' && !hasLabel()

/** 水平形态：带标签（div[role=separator] + 两侧细线）。 */
const isLabeledHorizontal = (): boolean => props.direction === 'horizontal' && hasLabel()

/** 根元素标签：hr（水平无标签）或 div（带标签/垂直）；hr 为 void 元素，绝不渲染子内容。 */
const rootTag = (): 'hr' | 'div' => (isHorizontalRule() ? 'hr' : 'div')

/** 根元素语义属性：hr 隐式 role=separator；div 形态显式声明，垂直须显式 aria-orientation。 */
const rootAriaAttrs = (): Record<string, string> => {
  if (isHorizontalRule()) return {}
  if (isLabeledHorizontal()) return { role: 'separator' }
  return { role: 'separator', 'aria-orientation': 'vertical' }
}

/** 根元素类：含方向与带标签形态修饰类（随渲染求值，保证插槽显隐同步）。 */
const rootClasses = (): Array<string | Record<string, boolean>> => [
  'ui-divider',
  `ui-divider--${props.direction}`,
  {
    'ui-divider--labeled': isLabeledHorizontal(),
  },
]
</script>

<template>
  <component :is="rootTag()" :class="rootClasses()" v-bind="rootAriaAttrs()">
    <template v-if="isLabeledHorizontal()">
      <span class="ui-divider__line" aria-hidden="true"></span>
      <span class="ui-divider__label">
        <slot name="label" />
      </span>
      <span class="ui-divider__line" aria-hidden="true"></span>
    </template>
  </component>
</template>

<style scoped>
/* ── 基底：结构性重置（细线颜色统一走 --ui-border）───────────────────── */
.ui-divider {
  border: 0; /* 结构性重置：去掉 hr 的 UA 默认描边，非视觉取值 */
  margin: 0; /* 结构性重置：默认间距按方向用 --ui-space-* 重新声明 */
}

/* ── 水平：细线 + 上下间距（24px，与表单字段间距同节奏）────────────────── */
.ui-divider--horizontal {
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Button/Input 先例在任务结果中提出需求） */
  border-top: 1px solid var(--ui-border);
  margin-block: var(--ui-space-5);
}

/* ── 水平带标签：flex 居中，标签两侧细线 ──────────────────────────────── */
.ui-divider--labeled {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
  border-top: 0; /* 覆盖水平细线：此形态由两侧 __line 承担线条 */
}

.ui-divider__line {
  flex: 1 1 auto;
  border-top: 1px solid var(--ui-border);
}

.ui-divider__label {
  flex: none;
  color: var(--ui-text-2);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
}

/* ── 垂直：拉伸父容器高度，左右间距（8px，行内节奏）────────────────────── */
.ui-divider--vertical {
  align-self: stretch;
  border-left: 1px solid var(--ui-border);
  margin-inline: var(--ui-space-2);
}
</style>
