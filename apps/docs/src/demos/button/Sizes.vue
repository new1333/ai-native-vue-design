<script setup lang="ts">
import { Button } from '@ui/components'
</script>

<template>
  <div class="demo-row">
    <Button size="sm" variant="primary">小号</Button>
    <Button size="md" variant="primary">中号（默认）</Button>
    <Button size="lg" variant="primary">大号</Button>
    <Button size="sm" block>块级铺满（sm）</Button>
  </div>
</template>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}

.demo-row :deep(.ui-button--block) {
  flex-basis: 100%;
}
</style>
