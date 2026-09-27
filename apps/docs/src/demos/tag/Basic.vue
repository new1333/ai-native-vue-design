<script setup lang="ts">
import { Tag } from '@ui/components'
</script>

<template>
  <div class="demo-row">
    <Tag>neutral（默认）</Tag>
    <Tag variant="success">已认证</Tag>
    <Tag variant="warning">试用版</Tag>
    <Tag variant="danger">已停用</Tag>
    <Tag variant="info">内部项目</Tag>
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
