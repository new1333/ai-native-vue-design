<script setup lang="ts">
import { Badge } from '@ui/components'
</script>

<template>
  <div class="demo-row">
    <Badge variant="info" dot>运行中</Badge>
    <Badge variant="success" dot>在线</Badge>
    <Badge variant="danger" dot>服务异常</Badge>
    <Badge variant="warning">待审核（无圆点对照）</Badge>
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
