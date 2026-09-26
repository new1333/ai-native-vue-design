<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@ui/components'

const title = ref('')
</script>

<template>
  <div class="demo-stack">
    <Input v-model="title" placeholder="文档标题" />
    <p class="demo-hint">
      当前值：<code>{{ title === '' ? '（空字符串）' : title }}</code>
      （v-model 绑定 string，受控；placeholder 只作占位，不替代 label——label 由使用方或 FormField 提供）
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
