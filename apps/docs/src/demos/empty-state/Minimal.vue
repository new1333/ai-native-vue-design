<script setup lang="ts">
import { Button, EmptyState } from '@ui/components'
</script>

<template>
  <EmptyState description="自动化模块尚未开通，开通后即可在这里配置规则。">
    <template #action>
      <Button size="sm">了解开通方式</Button>
    </template>
  </EmptyState>
</template>
