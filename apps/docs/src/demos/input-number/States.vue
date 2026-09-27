<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@ui/components'

// 外部注入的越界受控值：展示与 aria 按 clamp 后的值呈现，步进时回写钳制值
const clamped = ref<number | null>(999)
const manual = ref<number | null>(1)
</script>

<template>
  <div class="demo-stack">
    <InputNumber :model-value="8" :min="0" :max="10" disabled aria-label="库存（禁用）" />
    <InputNumber
      v-model="manual"
      :min="1"
      :max="10"
      :controls="false"
      aria-label="工时（无步进按钮）"
    />
    <InputNumber v-model="clamped" :min="0" :max="10" aria-label="越界受控值" />
    <p class="demo-hint">
      依次为：disabled（原生 disabled 移出 Tab 序，按钮与键盘步进全部拦截）；
      controls=false（不渲染 +/−，键盘 ↑↓/PageUp/PageDown/Home/End 仍可用，当前值
      <code>{{ manual ?? 'null（空）' }}</code>）；外部受控值 999 > max=10（展示按钳制值
      10 呈现，步进时回写钳制值，当前值 <code>{{ clamped ?? 'null（空）' }}</code>）。
      本组件为纯同步受控值，不设加载态。
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
