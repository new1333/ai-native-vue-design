<script setup lang="ts">
/**
 * CardHeader —— 卡片头部区块：标题层级的排版默认值（text-lg / semibold）。
 * 纯结构 + 插槽驱动，无自有交互与 aria（不产生 landmark）。
 */
import type { CardHeaderSlots } from './CardHeader.types'

defineSlots<CardHeaderSlots>()
</script>

<template>
  <div class="ui-card__header">
    <slot />
  </div>
</template>

<style scoped>
.ui-card__header {
  color: var(--ui-text-1);
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
}
</style>
