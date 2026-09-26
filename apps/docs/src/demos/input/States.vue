<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@ui/components'

const readonlyTitle = ref('只读标题：可聚焦可选中，不可编辑')
const email = ref('not-an-email')
</script>

<template>
  <div class="demo-stack">
    <Input model-value="该字段已停用" disabled />
    <Input v-model="readonlyTitle" readonly />
    <Input v-model="email" status="error" aria-describedby="input-email-error" />
    <p id="input-email-error" class="demo-input-error">邮箱格式不正确，请检查后重新输入。</p>
    <p class="demo-hint">
      disabled 用原生属性移出 Tab 序；readonly 保留聚焦与选中；status='error' 时描边转 danger 并推导
      aria-invalid="true"，aria-describedby 经 attrs 直达原生 input（供 FormField 接入）。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-input-error {
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
