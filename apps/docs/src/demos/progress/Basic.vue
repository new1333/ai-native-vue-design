<script setup lang="ts">
import { Progress } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Progress :value="42" show-label aria-label="空间占用" />
    <Progress :value="75" />
    <Progress :value="42" show-label size="sm" />
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}
</style>
