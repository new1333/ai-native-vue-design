<script setup lang="ts">
import { ref } from 'vue'
import { ToggleGroup } from '@ui/components'

const view = ref('card')
</script>

<template>
  <div class="demo-stack">
    <ToggleGroup
      v-model="view"
      :items="[
        { value: 'list', label: '列表' },
        { value: 'card', label: '卡片' },
        { value: 'board', label: '看板' },
      ]"
      aria-label="视图切换"
    />
    <p class="demo-hint">
      当前视图：<code>{{ view }}</code>
      （single 模式：radiogroup 语义，选中后不反选；Tab 落活动项、方向键移焦、Space/Enter 切换）
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
