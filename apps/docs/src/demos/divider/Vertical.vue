<script setup lang="ts">
import { Button, Divider } from '@ui/components'
</script>

<template>
  <div class="demo-toolbar">
    <Button size="sm" variant="secondary">复制</Button>
    <Button size="sm" variant="secondary">粘贴</Button>
    <Divider direction="vertical" />
    <Button size="sm" variant="secondary">加粗</Button>
    <Button size="sm" variant="secondary">斜体</Button>
  </div>
</template>

<style scoped>
.demo-toolbar {
  display: flex;
  gap: var(--ui-space-2);
  align-items: center;
}
</style>
