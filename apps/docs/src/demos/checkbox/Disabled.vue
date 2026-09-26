<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@ui/components'

const lockedOn = ref(true)
const lockedOff = ref(false)
</script>

<template>
  <div class="demo-stack">
    <Checkbox v-model="lockedOn" disabled label="已选中的禁用项" />
    <Checkbox v-model="lockedOff" disabled label="未选中的禁用项" />
    <p class="demo-hint">
      原生 disabled 移出 Tab 序并拦截一切切换路径：方块灰化、对勾/短横线与文本转弱色、not-allowed 光标。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
