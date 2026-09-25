<script setup lang="ts">
/**
 * CardBody —— 卡片主体区块：正文的排版默认值（text-md / body 行高）。
 * 纯结构 + 插槽驱动，无自有交互与 aria。
 */
import type { CardBodySlots } from './CardBody.types'

defineSlots<CardBodySlots>()
</script>

<template>
  <div class="ui-card__body">
    <slot />
  </div>
</template>

<style scoped>
.ui-card__body {
  color: var(--ui-text-1);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
}
</style>
