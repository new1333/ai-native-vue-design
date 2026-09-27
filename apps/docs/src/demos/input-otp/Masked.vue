<script setup lang="ts">
import { ref } from 'vue'
import { InputOtp } from '@ui/components'

const pin = ref('')
const filled = ref(false)

function onComplete(): void {
  filled.value = true
}
</script>

<template>
  <div class="demo-stack">
    <InputOtp v-model="pin" :length="4" masked aria-label="支付口令" @complete="onComplete" />
    <p class="demo-hint">
      masked 使全部格子渲染为 type="password"（逐格掩码，防旁人窥视）；
      <span v-if="filled" class="demo-complete">已填满（complete 已触发），可在业务侧提交校验。</span>
      <span v-else>填满后 complete 触发。</span>
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

.demo-complete {
  color: var(--ui-success);
}
</style>
