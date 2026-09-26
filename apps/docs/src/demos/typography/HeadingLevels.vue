<script setup lang="ts">
import { Heading } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Heading as="h1" size="2xl">页面主标题（as="h1"，每页至多一个）</Heading>
    <Heading>区块标题（默认档：as="h2" / size="xl" / weight 600）</Heading>
    <Heading as="h3" size="lg" :weight="500">卡片小标题（as="h3"，weight 500）</Heading>
    <Heading as="h4" size="md" color="muted">分组弱标题（as="h4"，color="muted"）</Heading>
    <Heading as="h5" size="sm">条目标题（as="h5"，size="sm"）</Heading>
    <Heading as="h6" size="xs" color="text-3">脚注级标题（as="h6"，size="xs"）</Heading>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}
</style>
