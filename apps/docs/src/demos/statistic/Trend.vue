<script setup lang="ts">
import { ref } from 'vue'
import { Button, Statistic } from '@ui/components'
import type { StatisticTrend } from '@ui/components'

const trend = ref<StatisticTrend>('up')
const value = ref(12.8)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-kpis">
      <Statistic title="本周新增" :value="value" :precision="1" suffix="%" :trend="trend" />
      <Statistic title="订单量" :value="3264" suffix="单" trend="down" />
    </div>
    <div class="demo-actions">
      <Button size="sm" :variant="trend === 'up' ? 'primary' : 'secondary'" @click="trend = 'up'">
        上升
      </Button>
      <Button size="sm" :variant="trend === 'down' ? 'primary' : 'secondary'" @click="trend = 'down'">
        下降
      </Button>
      <Button size="sm" variant="secondary" @click="value = Math.round(Math.random() * 900) / 10">
        换个数
      </Button>
    </div>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-kpis {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-5);
}

.demo-actions {
  display: flex;
  gap: var(--ui-space-2);
}
</style>
