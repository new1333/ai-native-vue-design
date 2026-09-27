<script setup lang="ts">
import { ref } from 'vue'
import { Button, Rating } from '@ui/components'
import type { RatingValue } from '@ui/components'

const score = ref<RatingValue | undefined>(2)
const hovering = ref<RatingValue | undefined>(undefined)

function setScore(value: RatingValue | undefined): void {
  score.value = value
}

function onHoverChange(value: RatingValue | undefined): void {
  hovering.value = value
}
</script>

<template>
  <div class="demo-stack">
    <Rating
      :model-value="score"
      aria-label="受控评分"
      @update:model-value="setScore"
      @hover-change="onHoverChange"
    />
    <div class="demo-actions">
      <Button size="sm" :variant="score === 5 ? 'primary' : 'secondary'" @click="setScore(5)">
        编程式选中 5 星
      </Button>
      <Button size="sm" :variant="score === undefined ? 'primary' : 'secondary'" @click="setScore(undefined)">
        编程式清除
      </Button>
    </div>
    <p class="demo-hint">
      受控值：<code>{{ score ?? '未评分' }}</code>；hoverChange 实时载荷：<code>{{ hovering ?? '未悬停' }}</code>
      （受控组件：视觉完全由 modelValue 派生，改值即编程式选中/清除，无需触碰组件实例；
      hoverChange 为悬停预览回调，进入档位发其值、离开组件发 undefined，只读态不触发）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
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
