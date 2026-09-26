<script setup lang="ts">
import { ref } from 'vue'
import { Button, Pagination } from '@ui/components'

/** total=60、pageSize 默认 10 → 共 6 页。 */
const LAST_PAGE = 6

const page = ref(3)
const lastEmitted = ref<number | null>(null)

/** 显式受控写法：:page + @update:page（v-model:page 的展开形式）。 */
function handleUpdatePage(next: number): void {
  lastEmitted.value = next
  page.value = next
}

function goFirst(): void {
  page.value = 1
}

function goLast(): void {
  page.value = LAST_PAGE
}

/** 越界值：展示层收敛（clamp）到末页渲染，受控值本身仍需使用方自行修正。 */
function setOutOfRange(): void {
  page.value = 99
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" variant="secondary" @click="goFirst">跳到第 1 页</Button>
      <Button size="sm" variant="secondary" @click="goLast">跳到末页</Button>
      <Button size="sm" variant="secondary" @click="setOutOfRange">把受控值改成 99（观察 clamp）</Button>
    </div>
    <Pagination :page="page" :total="60" @update:page="handleUpdatePage" />
    <p class="demo-hint">
      最近一次 update:page 载荷：
      <code v-if="lastEmitted !== null">{{ lastEmitted }}</code>
      <code v-else>尚无</code>
      （页值为 99 时展示层收敛到第 6 页、下一页禁用，但受控值仍需使用方自行修正回范围内）
    </p>
    <div class="demo-section">
      <p class="demo-label">单页数据（total=5，只推导出 1 页）：</p>
      <Pagination :page="1" :total="5" />
      <p class="demo-hint">第 1 页上上一页禁用、末页上下一页禁用；单页时两个翻页钮同时原生 disabled。</p>
    </div>
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
