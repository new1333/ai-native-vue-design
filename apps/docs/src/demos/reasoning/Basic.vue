<script setup lang="ts">
import { Reasoning } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Reasoning
      content="先观察数据分布与样本量：n=320 且两组方差接近，符合独立样本 t 检验的前提；再核对显著性水平 α=0.05；最后补充效应量 Cohen's d，避免只看 p 值下结论。"
      :duration="3.2"
    />

    <Reasoning content="这是一条没有传 duration 的历史思考记录。" />
  </div>
</template>

<style scoped>
.demo-stack {
  display: grid;
  gap: var(--ui-space-5);
}
</style>
