<script setup lang="ts">
import { Button, EmptyState } from '@ui/components'
</script>

<template>
  <EmptyState
    title="还没有任何项目"
    description="创建第一个项目后，团队的工作区会展示在这里。"
  >
    <template #action>
      <Button variant="primary">新建项目</Button>
    </template>
  </EmptyState>
</template>
