<script setup lang="ts">
/**
 * Layout —— 页面骨架根容器：flex 纵向堆叠 LayoutHeader/LayoutContent/LayoutFooter；
 * 默认插槽的直接子节点中出现 LayoutSider 时自动切横向（--has-sider），
 * SaaS 经典结构为 Layout > (LayoutSider + Layout > (Header/Content/Footer))。
 * 一切颜色、间距、字号均消费 var(--ui-*) token（paper.css）。
 */
import { computed, useSlots } from 'vue'
import LayoutSider from './LayoutSider.vue'
import { hasVNodeOfType } from './useLayout'
import type { LayoutSlots } from './Layout.types'

defineSlots<LayoutSlots>()

const slots = useSlots()

// has-sider 在渲染期由直接子节点静态推导：SSR 单遍渲染即得横向类，无子组件注册时序问题。
const hasSider = computed(() => hasVNodeOfType(slots.default?.() ?? [], LayoutSider))

const classes = computed(() => ['ui-layout', { 'ui-layout--has-sider': hasSider.value }])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<style scoped>
/* ── 基底：纵向 flex 骨架；flex/min 尺寸使嵌套内层 Layout 能填充剩余空间 ── */
.ui-layout {
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  font-family: var(--ui-font-sans);
  color: var(--ui-text-1);
}

/* ── has-sider：直接子节点含 LayoutSider 时切横向（Sider 占左，内层 Layout 占余宽）── */
.ui-layout--has-sider {
  flex-direction: row;
}
</style>
