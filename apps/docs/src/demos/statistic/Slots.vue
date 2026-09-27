<script setup lang="ts">
import { Statistic } from '@ui/components'

/** 千分位分组：组件只做 toFixed(precision)，复杂格式走 #default 由使用方渲染。 */
function thousands(n: number): string {
  return n.toLocaleString('en-US')
}
</script>

<template>
  <div class="demo-kpis">
    <Statistic :value="58032">
      <template #title>
        <span class="demo-title">
          <svg
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
              d="M3 17l6-6 4 4 8-8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          近 30 天访问
        </span>
      </template>
      <template #default>{{ thousands(58032) }}</template>
      <template #suffix>次</template>
    </Statistic>

    <Statistic :value="24" title="今日待办">
      <template #prefix>约</template>
      <template #suffix>件</template>
    </Statistic>
  </div>
</template>

<style scoped>
.demo-kpis {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-5);
}

.demo-title {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  color: var(--ui-text-2);
}
</style>
