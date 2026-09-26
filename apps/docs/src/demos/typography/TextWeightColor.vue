<script setup lang="ts">
import { Text } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Text as="p" :weight="600">字重 600（semibold）· 强调结论的正文</Text>
    <Text as="p" :weight="500">字重 500（medium）· 中等强调</Text>
    <Text as="p">字重 400（regular）· 默认正文；成段内容把 as 设为 p，行内文本用默认 span</Text>
    <Text as="p" color="text-2">颜色 text-2 · 次级说明文字</Text>
    <Text as="p" color="muted">颜色 muted · text-2 的简写别名档，渲染结果相同</Text>
    <Text as="p" color="text-3">颜色 text-3 · 脚注 / 弱提示</Text>
    <Text as="div" size="sm" color="text-2">as 取 div · 块级容器文本（as 共 span / p / div 三档）</Text>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}
</style>
