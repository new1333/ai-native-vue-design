<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@ui/components'

const readonlySummary = ref('只读摘要：可聚焦可选中，不可编辑。')
const feedback = ref('这条反馈包含待审核的表述，暂未通过。')
</script>

<template>
  <div class="demo-stack">
    <Textarea v-model="readonlySummary" :rows="2" readonly />
    <Textarea v-model="feedback" :rows="3" status="error" aria-describedby="textarea-feedback-error" />
    <p id="textarea-feedback-error" class="demo-textarea-error">内容未通过审核，请修改后再提交。</p>
    <Textarea model-value="该字段已停用" :rows="2" disabled />
    <p class="demo-hint">
      disabled 用原生属性移出 Tab 序；readonly 可聚焦可选中、不可编辑；status='error' 时描边转 danger 并推导
      aria-invalid="true"，aria-describedby 经 attrs 直达原生 textarea。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-textarea-error {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-danger);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
