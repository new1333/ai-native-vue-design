<script setup lang="ts">
import { Rating } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-block">
      <p class="demo-field-label">整星只读（商品评分摘要）</p>
      <Rating :model-value="4" readonly aria-label="商品评分（只读）" />
    </div>
    <div class="demo-block">
      <p class="demo-field-label">半星只读（聚合评分，allowHalf + readonly）</p>
      <Rating :model-value="2.5" allow-half readonly aria-label="配送时效评分（只读）" />
    </div>
    <p class="demo-hint">
      readonly 仅展示评分：悬停/点击/键盘全部守卫，档位移出 Tab 序（tabindex=-1）并置
      aria-readonly="true"，视觉保持原色（展示语义优先于灰化）。静态展示无需 v-model。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-5);
}

.demo-block {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-field-label {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
