<script setup lang="ts">
import { ref } from 'vue'
import { InputOtp } from '@ui/components'

const code = ref('')
const completed = ref('')
</script>

<template>
  <div class="demo-stack">
    <InputOtp v-model="code" aria-label="短信验证码" @complete="completed = $event" />
    <p class="demo-hint">
      当前值：<code>{{ code === '' ? '（空字符串）' : code }}</code>
      <span v-if="completed !== ''" class="demo-complete">已填满，complete 已触发（{{ completed }}）</span>
    </p>
    <p class="demo-hint">
      逐格键入自动前进到下一格；Backspace 在空格子上回退删除前一格；粘贴整段验证码会自动分发到后续格位。
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

.demo-complete {
  margin-left: var(--ui-space-2);
  color: var(--ui-success);
}
</style>
