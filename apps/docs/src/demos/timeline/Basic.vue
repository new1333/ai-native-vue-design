<script setup lang="ts">
import { Timeline } from '@ui/components'
import type { TimelineItem } from '@ui/components'

const items: TimelineItem[] = [
  { key: 'created', title: '订单创建', description: '用户提交订单，等待支付', time: '2026-09-27 09:12' },
  { key: 'paid', title: '支付成功', description: '微信支付 ¥128.00', time: '2026-09-27 09:15' },
  { key: 'shipped', title: '订单发货', description: '顺丰速运 SF1234567890', time: '2026-09-27 14:02' },
]
</script>

<template>
  <div class="demo-stack">
    <Timeline :items="items" />
    <p class="demo-hint">
      items 按数组顺序自上而下渲染（传入前先排好时间序）；每项 title 必填，
      description / time 可选弱化展示，key 提供稳定 v-for 键。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
