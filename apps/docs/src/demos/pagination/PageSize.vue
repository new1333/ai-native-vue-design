<script setup lang="ts">
import { ref } from 'vue'
import { Button, Pagination } from '@ui/components'

const TOTAL = 300
const PAGE_SIZES = [10, 20, 50] as const

const pageSize = ref<number>(10)
const page = ref(1)

/** 切换每页条数后把 page 重置为 1（meta.composition.preferred 的推荐配套动作）。 */
function pickPageSize(size: number): void {
  pageSize.value = size
  page.value = 1
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button
        v-for="size in PAGE_SIZES"
        :key="size"
        size="sm"
        :variant="pageSize === size ? 'primary' : 'secondary'"
        @click="pickPageSize(size)"
      >
        每页 {{ size }} 条
      </Button>
    </div>
    <Pagination v-model:page="page" :total="TOTAL" :page-size="pageSize" />
    <p class="demo-hint">
      total 固定为 300：每页 10 / 20 / 50 条分别推导出 30 / 15 / 6 页；
      切换每页条数后按推荐把 page 重置为 1，避免落在旧范围上。
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

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
