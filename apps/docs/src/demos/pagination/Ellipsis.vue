<script setup lang="ts">
import { ref } from 'vue'
import { Button, Pagination } from '@ui/components'

/** pageSize 默认 10 → 共 100 页，超过全显阈值（siblingCount*2+5=7）进入折叠形态。 */
const TOTAL = 1000

const page = ref(50)

function goTo(value: number): void {
  page.value = value
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" variant="secondary" @click="goTo(2)">到第 2 页（窗口贴左）</Button>
      <Button size="sm" variant="secondary" @click="goTo(50)">到第 50 页（两侧省略号）</Button>
      <Button size="sm" variant="secondary" @click="goTo(99)">到第 99 页（窗口贴右）</Button>
    </div>
    <div class="demo-section">
      <p class="demo-label">siblingCount=1（默认：当前页两侧各保留 1 个页码）</p>
      <Pagination v-model:page="page" :total="TOTAL" />
    </div>
    <div class="demo-section">
      <p class="demo-label">siblingCount=2（滑动窗口加宽为 2×2+1=5 个页码）</p>
      <Pagination v-model:page="page" :total="TOTAL" :sibling-count="2" />
    </div>
    <p class="demo-hint">
      总页数超过 siblingCount×2+5 时折叠为 首页 + 滑动窗口 + 尾页，被折叠的连续页码以省略号占位
      （aria-hidden、不可聚焦）；两个实例共享同一个受控页值，点击任一处同步。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-label {
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
