<script setup lang="ts">
import { Button, Card, CardBody, CardFooter, CardHeader } from '@ui/components'
</script>

<template>
  <Card>
    <CardHeader>
      <h3 class="demo-heading">部署概览</h3>
    </CardHeader>
    <CardBody>
      最近一次部署于 2 小时前完成，覆盖 3 个服务、12 个实例，全部健康。
    </CardBody>
    <CardFooter>
      <div class="demo-actions">
        <Button size="sm" variant="primary">查看日志</Button>
        <Button size="sm">重新部署</Button>
      </div>
    </CardFooter>
  </Card>
</template>

<style scoped>
/* 原生标题的语义层级由使用方决定；排版默认值交给 CardHeader，仅重置文档站全局标题样式 */
.demo-heading {
  margin: 0;
  font-size: inherit;
  font-weight: var(--ui-font-weight-semibold);
  line-height: inherit;
}

.demo-actions {
  display: flex;
  gap: var(--ui-space-2);
}
</style>
