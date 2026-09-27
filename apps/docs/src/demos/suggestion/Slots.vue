<script setup lang="ts">
import { ref } from 'vue'
import { Suggestion } from '@ui/components'
import type { SuggestionItem } from '@ui/components'

const items: SuggestionItem[] = [
  { label: '总结要点', value: '请总结本次讨论的要点' },
  { label: '给出示例', value: '请给出一个可运行的代码示例' },
  { label: '深入原理', value: '请解释底层实现原理' },
]

const picked = ref<string>('')
</script>

<template>
  <div class="demo-col">
    <Suggestion :items="items" aria-label="推荐追问" @select="picked = $event.value">
      <template #default>
        <span class="demo-prefix">
          <svg
            class="demo-prefix-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 4l2.2 5.3 5.8 2.7-5.8 2.7L12 20l-2.2-5.3L4 12l5.8-2.7L12 4z"
              stroke-linejoin="round"
            />
          </svg>
          推荐追问
        </span>
      </template>
      <template #item="{ item, index }">
        <span class="demo-chip-index">{{ index + 1 }}</span>
        <span>{{ item.label }}</span>
      </template>
    </Suggestion>

    <p class="demo-result">
      <template v-if="picked">已回填：{{ picked }}</template>
      <template v-else>#item 作用域为 { item, index }；#default 为 chips 前置内容。</template>
    </p>
  </div>
</template>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-prefix {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  color: var(--ui-text-2);
}

.demo-prefix-icon {
  flex: none;
  color: var(--ui-accent);
}

.demo-chip-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--ui-space-4);
  padding: 0 var(--ui-space-1);
  border-radius: var(--ui-radius-xs);
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-size: var(--ui-text-xs);
  font-variant-numeric: var(--ui-numeric);
}

.demo-result {
  margin: 0;
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}
</style>
