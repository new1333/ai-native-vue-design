<script setup lang="ts">
/**
 * CardFooter —— 卡片底部区块：动作区/补充说明的排版默认值（text-sm / text-2）。
 * 纯结构 + 插槽驱动，无自有交互与 aria。
 */
import type { CardFooterSlots } from './CardFooter.types'

defineSlots<CardFooterSlots>()
</script>

<template>
  <div class="ui-card__footer">
    <slot />
  </div>
</template>

<style scoped>
.ui-card__footer {
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}
</style>
