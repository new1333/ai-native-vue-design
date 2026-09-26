<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@ui/components'

const freeText = ref("默认 resize='vertical'：拖拽右下角可调整高度，横向锁定不破坏容器栅格。")
const summary = ref("resize='none'：锁定为固定尺寸，与 rows 搭配适合只读摘要等固定栅格场景。")
</script>

<template>
  <div class="demo-stack">
    <Textarea v-model="freeText" :rows="3" />
    <Textarea v-model="summary" :rows="2" resize="none" />
    <p class="demo-hint">
      resize 支持 'vertical'（默认）与 'none' 两档；只读摘要展示可用 resize='none' + readonly 组合。
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
