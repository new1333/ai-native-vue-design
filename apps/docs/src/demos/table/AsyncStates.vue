<script setup lang="ts">
import { ref } from 'vue'
import { Button, Table } from '@ui/components'
import type { TableColumn } from '@ui/components'

interface Service {
  id: number
  name: string
  env: string
}

const columns: TableColumn<Service>[] = [
  { key: 'name', label: '服务' },
  { key: 'env', label: '环境' },
]

const fullData: Service[] = [
  { id: 1, name: 'paper-web', env: '生产' },
  { id: 2, name: 'paper-api', env: '预发' },
]

const loading = ref(false)
const data = ref<Service[]>([...fullData])

function toggleLoading(): void {
  loading.value = !loading.value
}

function toggleEmpty(): void {
  data.value = data.value.length ? [] : [...fullData]
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" :variant="loading ? 'primary' : 'secondary'" @click="toggleLoading">
        {{ loading ? '停止加载（loading）' : '切换为加载中' }}
      </Button>
      <Button size="sm" :variant="data.length === 0 ? 'primary' : 'secondary'" @click="toggleEmpty">
        {{ data.length === 0 ? '恢复数据' : '切换为空数据' }}
      </Button>
    </div>
    <Table :columns="columns" :data="data" row-key="id" :loading="loading" />
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
  gap: var(--ui-space-2);
}
</style>
