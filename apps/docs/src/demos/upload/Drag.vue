<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@ui/components'
import type { UploadFile } from '@ui/components'

const images = ref<UploadFile[]>([])
</script>

<template>
  <div class="demo-stack">
    <Upload v-model="images" drag multiple accept="image/*" />
    <p class="demo-hint">
      drag：触发器变为虚线拖放区并接管 drop；悬停时拖放区转 accent 高亮；
      multiple 允许一次拖入多个文件（false 时只取第一个）。
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
