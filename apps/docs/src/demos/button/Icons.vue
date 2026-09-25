<script setup lang="ts">
import { Button } from '@ui/components'
</script>

<template>
  <div class="demo-row">
    <Button variant="primary">
      <template #icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </template>
      开始分析
    </Button>
    <Button>
      继续
      <template #iconRight>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </template>
    </Button>
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
