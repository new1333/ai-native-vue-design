<script setup lang="ts">
import { Alert } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Alert severity="info" title="实验特性">
      <template #icon>
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.2 2.2M16.2 16.2l2.2 2.2M18.4 5.6l-2.2 2.2M7.8 16.2l-2.2 2.2" />
        </svg>
      </template>
      通过 #icon 插槽覆盖内建语义图标；图标颜色仍随 severity 语义色（currentColor）。
    </Alert>
    <Alert severity="danger">
      <template #icon>
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      </template>
      正文-only 的警示条同样支持图标覆盖；此为 danger 档，role=alert。
    </Alert>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}
</style>
