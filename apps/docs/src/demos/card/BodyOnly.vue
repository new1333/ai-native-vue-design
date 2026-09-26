<script setup lang="ts">
import { Card, CardBody } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Card>
      <CardBody>
        <h3 class="demo-heading">周报</h3>
        <p class="demo-paragraph">本周新增 12 个组件，修复 34 个缺陷，文档覆盖率达到 92%。</p>
      </CardBody>
    </Card>
    <Card>任意内容也可以直接放进默认插槽，不经区块组件包裹。</Card>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-heading {
  margin: 0;
  font-size: inherit;
  font-weight: var(--ui-font-weight-semibold);
  line-height: inherit;
}

.demo-paragraph {
  margin: var(--ui-space-1) 0 0;
}
</style>
