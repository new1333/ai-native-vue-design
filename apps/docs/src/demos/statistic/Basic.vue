<script setup lang="ts">
import { Statistic } from '@ui/components'
</script>

<template>
  <div class="demo-kpis">
    <Statistic title="总营收" :value="128430.5" :precision="2" prefix="¥" />
    <Statistic title="活跃用户" :value="8642" suffix="人" />
    <Statistic title="转化率" :value="3.6" :precision="1" suffix="%" />
  </div>
</template>

<style scoped>
.demo-kpis {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-5);
}
</style>
