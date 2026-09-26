<script setup lang="ts">
import { Badge, Button, Card, CardBody, CardFooter, CardHeader } from '@ui/components'
</script>

<template>
  <Card>
    <CardHeader>
      <div class="demo-header">
        <h3 class="demo-heading">paper-ui 发布流水线</h3>
        <Badge variant="success" dot>运行中</Badge>
      </div>
    </CardHeader>
    <CardBody>
      <div class="demo-steps">
        <span>1 · 类型检查与 382 项单测门禁通过</span>
        <span>2 · 文档站构建完成，新增 4 个组件页</span>
        <span>3 · 等待人工审核后发布</span>
      </div>
    </CardBody>
    <CardFooter>
      <div class="demo-footer">
        <span>最近更新于 5 分钟前</span>
        <Button size="sm" variant="primary">查看报告</Button>
      </div>
    </CardFooter>
  </Card>
</template>

<style scoped>
.demo-header {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-heading {
  margin: 0;
  font-size: inherit;
  font-weight: var(--ui-font-weight-semibold);
  line-height: inherit;
}

.demo-steps {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
}
</style>
