<script setup lang="ts">
import { ref } from 'vue'
import { Table } from '@ui/components'
import type { TableColumn, TableSortPayload } from '@ui/components'

interface Member {
  id: number
  name: string
  role: string
  commits: number
}

const columns: TableColumn<Member>[] = [
  { key: 'name', label: '成员', sortable: true },
  { key: 'role', label: '角色' },
  { key: 'commits', label: '提交数', align: 'right', sortable: true },
]

const data: Member[] = [
  { id: 1, name: '林一', role: '核心维护', commits: 342 },
  { id: 2, name: '陈二', role: '组件开发', commits: 218 },
  { id: 3, name: '周四', role: '文档与示例', commits: 96 },
  { id: 4, name: '吴六', role: '质量守护', commits: 187 },
]

const lastSort = ref<TableSortPayload | null>(null)

function onSort(payload: TableSortPayload): void {
  lastSort.value = payload
}
</script>

<template>
  <div class="demo-stack">
    <Table :columns="columns" :data="data" row-key="id" @sort="onSort" />
    <p class="demo-hint">
      最近一次 sort 事件：
      <code v-if="lastSort">key={{ lastSort.key }}，order={{ lastSort.order }}</code>
      <code v-else>尚未排序</code>
      （循环 none → asc → desc → none；键盘 Enter / Space 同样可触发）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
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
