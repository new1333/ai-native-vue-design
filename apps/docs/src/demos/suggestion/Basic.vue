<script setup lang="ts">
import { ref } from 'vue'
import { Suggestion } from '@ui/components'
import type { SuggestionItem } from '@ui/components'

const items: SuggestionItem[] = [
  { label: '总结要点', value: '请总结本次讨论的要点' },
  { label: '给出示例', value: '请给出一个可运行的代码示例' },
  { label: '深入原理', value: '请解释底层实现原理' },
  { label: '推荐延伸阅读', value: '请推荐延伸阅读资料' },
]

const lastSelected = ref<SuggestionItem | null>(null)
</script>

<template>
  <div class="demo-col">
    <Suggestion :items="items" aria-label="推荐追问" @select="lastSelected = $event" />
    <p class="demo-result">
      <template v-if="lastSelected">
        最近选中：<strong>{{ lastSelected.label }}</strong>（value：{{ lastSelected.value }}）
      </template>
      <template v-else>点击任意 chip，观察 select 上抛的完整 item。</template>
    </p>
  </div>
</template>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-result {
  margin: 0;
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

.demo-result strong {
  color: var(--ui-text-1);
  font-weight: var(--ui-font-weight-medium);
}
</style>
