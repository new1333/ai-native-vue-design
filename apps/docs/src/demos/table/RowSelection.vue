<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Table } from '@ui/components'
import type { TableColumn } from '@ui/components'

interface Member {
  id: number
  name: string
  role: string
  commits: number
}

const columns: TableColumn<Member>[] = [
  { key: 'name', label: '成员' },
  { key: 'role', label: '角色' },
  { key: 'commits', label: '提交数', align: 'right' },
]

/** 两页数据：翻页模拟分页/过滤，选中以 rowKey 键跨页保持。 */
const allMembers: Member[] = [
  { id: 1, name: '林一', role: '核心维护', commits: 342 },
  { id: 2, name: '陈二', role: '组件开发', commits: 218 },
  { id: 3, name: '周四', role: '文档与示例', commits: 96 },
  { id: 4, name: '吴六', role: '质量守护', commits: 187 },
  { id: 5, name: '郑七', role: '外部贡献', commits: 45 },
  { id: 6, name: '王九', role: '外部贡献', commits: 31 },
  { id: 7, name: '冯十', role: '组件开发', commits: 156 },
  { id: 8, name: '褚三', role: '核心维护', commits: 274 },
]

const PAGE_SIZE = 4
const page = ref(0)
const pageCount = Math.ceil(allMembers.length / PAGE_SIZE)
const pageRows = computed(() =>
  allMembers.slice(page.value * PAGE_SIZE, page.value * PAGE_SIZE + PAGE_SIZE),
)

/** 受控选中键集合：跨页保持（基于键而非行引用）。 */
const selectedRowKeys = ref<(string | number)[]>([])

/** 外部贡献行不可选（按行 disabled）。 */
const rowSelection = {
  getCheckboxProps: (row: Member) => ({ disabled: row.role === '外部贡献' }),
}

const selectedNames = computed(() =>
  allMembers
    .filter((member) => selectedRowKeys.value.includes(member.id))
    .map((member) => member.name),
)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" variant="secondary" :disabled="page === 0" @click="page -= 1">
        上一页
      </Button>
      <span class="demo-page">第 {{ page + 1 }} / {{ pageCount }} 页</span>
      <Button size="sm" variant="secondary" :disabled="page === pageCount - 1" @click="page += 1">
        下一页
      </Button>
    </div>
    <Table
      v-model:selected-row-keys="selectedRowKeys"
      :columns="columns"
      :data="pageRows"
      row-key="id"
      :row-selection="rowSelection"
    />
    <p class="demo-hint">
      已选 <code>{{ selectedRowKeys.length }}</code> 行：
      <code>{{ selectedNames.length ? selectedNames.join('、') : '（无）' }}</code>
      （表头全选含半选态、跳过禁用的「外部贡献」行；翻页后已选键保持，再全选会合并两页的键）
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
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-page {
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
