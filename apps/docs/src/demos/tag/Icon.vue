<script setup lang="ts">
import { Tag } from '@ui/components'
</script>

<template>
  <div class="demo-row">
    <Tag variant="info">
      <template #icon>
        <!-- 装饰性图标：自行 aria-hidden，颜色随文字色（currentColor） -->
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
          <path d="M12 11.2v4.6" />
          <path d="M12 7.9h.01" />
        </svg>
      </template>
      内部项目
    </Tag>
    <Tag variant="success">
      <template #icon>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
          <path d="m8.5 12.3 2.4 2.4 4.6-5.4" />
        </svg>
      </template>
      已认证
    </Tag>
    <Tag>无图标对照</Tag>
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
