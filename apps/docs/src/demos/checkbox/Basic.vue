<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@ui/components'

const agreed = ref(false)
const subscribe = ref(true)
</script>

<template>
  <div class="demo-stack">
    <Checkbox v-model="agreed" label="我已阅读并同意服务条款" />
    <Checkbox v-model="subscribe" label="订阅产品周报" />
    <p class="demo-hint">
      当前值：同意 <code>{{ agreed }}</code> · 订阅 <code>{{ subscribe }}</code>
      （v-model 绑定 boolean，受控；label prop 提供可读名称——纯文本场景首选；Tab 进入、Space 原生切换）
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
