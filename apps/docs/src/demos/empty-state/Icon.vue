<script setup lang="ts">
import { Button, EmptyState } from '@ui/components'
</script>

<template>
  <EmptyState title="没有找到匹配结果">
    <template #icon>
      <!-- 业务图标保持线稿规格：viewBox 0 0 24 24、stroke-width 1.5、currentColor、24px -->
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    </template>
    <template #action>
      <Button variant="ghost">清除筛选</Button>
    </template>
  </EmptyState>
</template>
