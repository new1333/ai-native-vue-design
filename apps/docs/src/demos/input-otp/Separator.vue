<script setup lang="ts">
import { ref } from 'vue'
import { InputOtp } from '@ui/components'

const phoneCode = ref('')
</script>

<template>
  <div class="demo-stack">
    <InputOtp v-model="phoneCode" :length="6" aria-label="手机验证码">
      <template #separator>-</template>
    </InputOtp>
    <p class="demo-hint">
      #separator 渲染于每个间隙（length - 1 处），按装饰处理（aria-hidden="true"）：
      屏幕阅读器只读每格的「第 N 位，共 M 位」与容器名称，不读分隔符。
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
