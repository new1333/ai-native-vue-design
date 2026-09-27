<script setup lang="ts">
import { ref } from 'vue'
import { InputOtp } from '@ui/components'

const numericCode = ref('')
const alnumToken = ref('')
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-label">numeric（默认）</span>
      <InputOtp v-model="numericCode" input-mode="numeric" aria-label="数字验证码" />
    </div>
    <div class="demo-row">
      <span class="demo-label">alphanumeric</span>
      <InputOtp v-model="alnumToken" input-mode="alphanumeric" aria-label="混合口令" />
    </div>
    <p class="demo-hint">
      inputMode 同时决定软键盘类型与字符过滤口径：numeric 触发数字软键盘且只接受 0-9；
      alphanumeric 接受 0-9 与英文字母（保留大小写），其余字符被过滤、不产生值变化。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: var(--ui-space-4);
  flex-wrap: wrap;
}

.demo-label {
  flex: none;
  min-width: 10em;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
