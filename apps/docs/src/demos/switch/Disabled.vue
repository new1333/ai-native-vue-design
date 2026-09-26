<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@ui/components'

const lockedOn = ref(true)
const lockedOff = ref(false)
</script>

<template>
  <div class="demo-stack">
    <Switch v-model="lockedOn" disabled label="已开启（仅企业版可用）" />
    <Switch v-model="lockedOff" disabled label="已关闭（仅企业版可用）" />
    <p class="demo-hint">
      原生 disabled 移出 Tab 序，一切切换路径无效：轨道灰化、圆点去投影、label 转弱色 + not-allowed 光标。
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
