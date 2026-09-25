<script setup lang="ts">
import { Button } from '@ui/components'
</script>

<template>
  <div class="demo-row">
    <Button variant="primary">主要动作</Button>
    <Button variant="secondary">常规动作</Button>
    <Button variant="ghost">安静动作</Button>
    <Button variant="danger">危险动作</Button>
  </div>
</template>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}
</style>
