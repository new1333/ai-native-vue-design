<script setup lang="ts">
import { ref } from 'vue'
import { Rating } from '@ui/components'
import type { RatingValue } from '@ui/components'

const score = ref<RatingValue | undefined>(3)
</script>

<template>
  <div class="demo-stack">
    <Rating v-model="score" :count="4" aria-label="收藏指数">
      <template #icon="{ state }">
        <!-- icon 插槽整体替换默认星形：填充态由使用方按 scope.state 自行渲染；
             half 态本示例视同 full 呈现（半星的呈现方式由插槽内容决定） -->
        <svg
          class="demo-heart"
          :class="`demo-heart--${state}`"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </template>
    </Rating>
    <p class="demo-hint">
      当前评分：<code>{{ score ?? '未评分（undefined）' }}</code>
      （icon 插槽作用域携带 index（星序号，1 起）/ value（该星满值）/ state（full / half / empty）；
      图标层为 aria-hidden，评分语义仍由组件内 role="radio" 的档位承载）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-heart {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  fill: none;
  stroke: var(--ui-text-3);
  stroke-width: 1.5;
}

.demo-heart--full,
.demo-heart--half {
  fill: var(--ui-danger);
  stroke: var(--ui-danger);
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
