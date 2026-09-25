<script setup lang="ts">
import { ref } from 'vue'
import { Badge, Button, EmptyState, Table } from '@ui/components'
import type { TableColumn } from '@ui/components'

interface Service {
  id: number
  name: string
  env: 'prod' | 'staging' | 'dev'
}

const columns: TableColumn<Service>[] = [
  { key: 'name', label: '服务' },
  { key: 'env', label: '环境（自定义单元格）' },
]

const services = ref<Service[]>([
  { id: 1, name: 'paper-web', env: 'prod' },
  { id: 2, name: 'paper-api', env: 'staging' },
])

const ENV_META: Record<Service['env'], { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  prod: { label: '生产', variant: 'success' },
  staging: { label: '预发', variant: 'warning' },
  dev: { label: '开发', variant: 'neutral' },
}

function clearAll(): void {
  services.value = []
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" :disabled="services.length === 0" @click="clearAll">清空数据（查看空态插槽）</Button>
    </div>
    <Table :columns="columns" :data="services" row-key="id">
      <template #cell-env="{ value }">
        <Badge :variant="ENV_META[value as Service['env']].variant" dot>
          {{ ENV_META[value as Service['env']].label }}
        </Badge>
      </template>
      <template #empty>
        <EmptyState
          title="还没有任何服务"
          description="接入第一个服务后，这里会展示环境与状态。"
        >
          <template #action>
            <Button size="sm" variant="primary">接入服务</Button>
          </template>
        </EmptyState>
      </template>
    </Table>
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
