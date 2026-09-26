<script setup lang="ts">
import { Heading, Text } from '@ui/components'

interface Metric {
  name: string
  amount: string
}

const metrics: Metric[] = [
  { name: '回款金额', amount: '1,024.00' },
  { name: '待开票', amount: '98.50' },
  { name: '坏账计提', amount: '7.25' },
]
</script>

<template>
  <div class="demo-stack">
    <div class="demo-columns">
      <div class="demo-column">
        <Text size="sm" color="text-3">未开启 numeric（比例数字宽度不一，小数点不对齐）</Text>
        <div v-for="metric in metrics" :key="metric.name" class="demo-metric">
          <Text color="text-2">{{ metric.name }}</Text>
          <Text class="demo-amount">{{ metric.amount }}</Text>
        </div>
      </div>
      <div class="demo-column">
        <Text size="sm" color="text-3">开启 numeric（tabular-nums，数字列上下对齐）</Text>
        <div v-for="metric in metrics" :key="metric.name" class="demo-metric">
          <Text color="text-2">{{ metric.name }}</Text>
          <Text class="demo-amount" numeric>{{ metric.amount }}</Text>
        </div>
      </div>
    </div>
    <div class="demo-kpi">
      <Text size="sm" color="muted">季度回款率（Heading 的 numeric 档同理，可用于 KPI 大数字）</Text>
      <Heading as="h3" size="2xl" numeric>98.6%</Heading>
    </div>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-5);
}

.demo-columns {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-6);
}

.demo-column {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-metric {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ui-space-4);
  width: calc(var(--ui-space-8) * 3);
}

.demo-kpi {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}
</style>
