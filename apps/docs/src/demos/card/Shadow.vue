<script setup lang="ts">
import { Card, CardBody } from '@ui/components'
</script>

<template>
  <div class="demo-row">
    <Card class="demo-half">
      <CardBody>
        shadow='none'（默认）：静止面无阴影，是卡片的常规状态。
      </CardBody>
    </Card>
    <Card class="demo-half" shadow="rest">
      <CardBody>
        shadow='rest'：唯一一档静止阴影（--ui-shadow-rest），用于同屏卡片之间的层次对比。
      </CardBody>
    </Card>
  </div>
</template>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-3);
  align-items: stretch;
}

.demo-half {
  flex: 1 1 0;
  min-width: 0;
}
</style>
