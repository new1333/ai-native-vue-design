<script setup lang="ts">
import { ref } from 'vue'
import { ToggleGroup, ToggleItem } from '@ui/components'

const density = ref('comfortable')

const layers = ref<string[]>(['terrain'])
</script>

<template>
  <div class="demo-stack">
    <ToggleGroup v-model="density" aria-label="信息密度">
      <ToggleItem value="compact">
        <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
          <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke-linecap="round" />
        </svg>
        紧凑
      </ToggleItem>
      <ToggleItem value="comfortable">
        <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
          <path d="M4 5h16M4 11h16M4 17h16" stroke-linecap="round" />
        </svg>
        宽松
      </ToggleItem>
    </ToggleGroup>

    <ToggleGroup v-model="layers" type="multiple" :items="[
      { value: 'terrain', label: '地形' },
      { value: 'river', label: '水系' },
      { value: 'road', label: '道路' },
    ]" aria-label="图层">
      <template #item="{ item, selected }">
        <svg
          v-if="selected"
          class="demo-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M5 12.5l4.5 4.5L19 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ item.label }}
      </template>
    </ToggleGroup>

    <p class="demo-hint">
      上：默认插槽手动组合 ToggleItem（图标 + 文本，svg aria-hidden）；下：items prop + #item 作用域插槽按选中态渲染对勾。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-icon {
  inline-size: var(--ui-space-4);
  block-size: var(--ui-space-4);
  flex: none;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
