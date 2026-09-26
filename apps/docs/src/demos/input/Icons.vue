<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@ui/components'

const keyword = ref('')
const count = ref('12')
</script>

<template>
  <div class="demo-stack">
    <Input v-model="keyword" placeholder="搜索组件">
      <template #prefix>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </template>
    </Input>
    <Input v-model="count" placeholder="每页条数">
      <template #suffix>项</template>
    </Input>
    <p class="demo-hint">
      #prefix 放前缀图标、#suffix 放单位文本：内联 SVG 遵循 viewBox 0 0 24 24、stroke-width 1.5、currentColor，尺寸由组件统一约束。
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
