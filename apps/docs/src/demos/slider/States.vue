<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@ui/components'

const controlled = ref(60)
const saving = ref(false)

function setValue(next: number): void {
  controlled.value = next
}

/** 模拟「改动即保存」的异步回写：期间置 loading 拦截一切取值路径。 */
function save(next: number | [number, number]): void {
  if (saving.value) return
  saving.value = true
  controlled.value = Array.isArray(next) ? next[0] : next
  window.setTimeout(() => {
    saving.value = false
  }, 1200)
}
</script>

<template>
  <div class="demo-stack">
    <Slider v-model="controlled" aria-label="受控值（外部可写）" />
    <div class="demo-actions">
      <button type="button" class="demo-button" @click="setValue(0)">设为 0</button>
      <button type="button" class="demo-button" @click="setValue(60)">设为 60</button>
      <button type="button" class="demo-button" @click="setValue(100)">设为 100</button>
      <span class="demo-hint">当前值：<code>{{ controlled }}</code>（受控：外部状态驱动，键盘/拖拽路径回写同一状态）</span>
    </div>

    <Slider :model-value="70" aria-label="模拟异步保存" :loading="saving" @change="save" />
    <p class="demo-hint">
      loading：aria-busy="true" 且键盘/拖拽/轨道点击全拦截，但柄保持可聚焦（不落 disabled）；
      disabled：tabindex="-1" + aria-disabled="true"，移出 Tab 序。
    </p>

    <Slider :model-value="40" disabled aria-label="系统锁定的值" />
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-button {
  padding: var(--ui-space-1) var(--ui-space-3);
  border: none; /* 结构性重置：非视觉取值 */
  background-color: var(--ui-accent-soft);
  border-radius: var(--ui-radius-sm);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  color: var(--ui-accent);
  cursor: pointer;
}

.demo-button:hover {
  background-color: var(--ui-accent);
  color: var(--ui-on-accent);
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
