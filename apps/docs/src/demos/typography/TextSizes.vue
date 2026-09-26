<script setup lang="ts">
import { Text } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Text size="3xl">字号 3xl · 大号展示文案</Text>
    <Text size="2xl">字号 2xl · 强调段落</Text>
    <Text size="xl">字号 xl · 导语 / 卡片主文案</Text>
    <Text size="lg">字号 lg · 次级段落</Text>
    <Text size="md">字号 md · 默认正文（缺省档）</Text>
    <Text size="sm">字号 sm · 次级说明</Text>
    <Text size="xs">字号 xs · 脚注 / 弱提示</Text>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}
</style>
