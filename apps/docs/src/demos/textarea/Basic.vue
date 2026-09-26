<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@ui/components'

const description = ref('')
</script>

<template>
  <div class="demo-stack">
    <Textarea v-model="description" :rows="4" placeholder="项目描述" />
    <p class="demo-hint">
      当前 <code>{{ description.length }}</code> 字
      （v-model 绑定 string，受控；rows 决定初始可见行数；默认 resize='vertical'，仅可垂直拉伸）
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
