<script setup lang="ts">
import { ref } from 'vue'
import { ToggleGroup } from '@ui/components'

const align = ref('left')
</script>

<template>
  <div class="demo-stack">
    <ToggleGroup
      v-model="align"
      variant="outline"
      :items="[
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中' },
        { value: 'right', label: '右对齐' },
      ]"
      aria-label="对齐方式"
    />
    <p class="demo-hint">
      当前对齐：<code>{{ align }}</code>
      （variant=outline：独立描边按钮组，选中项转 accent 描边 + accent-soft 底；工具栏紧凑场景首选）
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
