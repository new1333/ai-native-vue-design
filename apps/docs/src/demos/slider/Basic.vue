<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@ui/components'

const volume = ref(30)

const marks = [
  { value: 0, label: '静音' },
  { value: 50, label: '适中' },
  { value: 100, label: '最大' },
]
</script>

<template>
  <div class="demo-stack">
    <Slider v-model="volume" aria-label="音量" :marks="marks" />
    <p class="demo-hint">
      当前值：<code>{{ volume }}</code>
      （v-model 绑定 number，受控；方向键 ±1、PageUp/PageDown ±10、Home/End 直达边界；
      hover / 键盘聚焦 / 拖拽时柄上方显示值气泡）
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
