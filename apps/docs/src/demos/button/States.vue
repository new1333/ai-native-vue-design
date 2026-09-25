<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@ui/components'

const saving = ref(false)

function simulateSave(): void {
  saving.value = true
  window.setTimeout(() => {
    saving.value = false
  }, 2000)
}
</script>

<template>
  <div class="demo-row">
    <Button :loading="saving" variant="primary" @click="simulateSave">
      {{ saving ? '保存中…' : '模拟保存（loading 2s）' }}
    </Button>
    <Button disabled>禁用（移出 Tab 序）</Button>
    <Button variant="danger" type="button" @click="() => undefined">危险（hover 转实底）</Button>
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
