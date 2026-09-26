<script setup lang="ts">
import { Badge } from '@ui/components'
</script>

<template>
  <div class="demo-row">
    <Badge>neutral（默认）</Badge>
    <Badge variant="success">已完成</Badge>
    <Badge variant="warning">待审核</Badge>
    <Badge variant="danger">已失败</Badge>
    <Badge variant="info">同步中</Badge>
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
