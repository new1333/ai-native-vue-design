<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup } from '@ui/components'
import type { RadioValue } from '@ui/components'

const shipping = ref<RadioValue | undefined>(undefined)
</script>

<template>
  <div class="demo-stack">
    <RadioGroup v-model="shipping" name="shipping" aria-label="配送方式">
      <Radio value="express" label="顺丰快递" />
      <Radio value="economy" label="经济件" />
      <Radio value="pickup" label="门店自提" />
    </RadioGroup>
    <p class="demo-hint">
      当前选中：<code>{{ shipping ?? '未选择（undefined）' }}</code>
      （Radio 必须包在 RadioGroup 内：组提供必填 name——同组互斥与方向键导航由浏览器按 name 实现；
      组容器纵向排布，渲染序即 Tab / 方向键导航序。aria-label 经 attrs 落在 role="radiogroup" 容器上）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
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
