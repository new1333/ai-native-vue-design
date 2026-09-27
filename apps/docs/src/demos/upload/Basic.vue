<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@ui/components'
import type { UploadFile } from '@ui/components'

const files = ref<UploadFile[]>([])
</script>

<template>
  <div class="demo-stack">
    <Upload v-model="files" />
    <p class="demo-hint">
      已选 {{ files.length }} 个文件：<code>{{ files.map((f) => f.name).join('、') || '（空列表）' }}</code>
      （未提供 beforeUpload 时，选择即以上传成功入列；列表完全受控：v-model 绑定全量 UploadFile[]）
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
