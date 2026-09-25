<script setup lang="ts">
import { Button, ButtonGroup } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <ButtonGroup>
      <Button>复制</Button>
      <Button>编辑</Button>
      <Button variant="danger">删除</Button>
    </ButtonGroup>
    <ButtonGroup size="sm">
      <Button>复制</Button>
      <Button>编辑</Button>
      <Button>归档</Button>
    </ButtonGroup>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  align-items: flex-start;
}
</style>
