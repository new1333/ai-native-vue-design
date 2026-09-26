<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@ui/components'

const notify = ref(true)
</script>

<template>
  <div class="demo-stack">
    <Checkbox v-model="notify">
      接收<strong>每周摘要</strong>
      <span class="demo-checkbox-note">仅在累积足够更新时发送，不打扰日常</span>
    </Checkbox>
    <p class="demo-hint">
      默认插槽优先于 label prop，可承载富文本（链接等内联内容同理）；
      根为 label 元素，点击文本任意位置即切换。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-checkbox-note {
  margin-left: var(--ui-space-2);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
