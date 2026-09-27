<script setup lang="ts">
import { Button, Popconfirm } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popconfirm placement="top" title="向上弹出">
        <template #trigger>
          <Button variant="secondary">top（默认）</Button>
        </template>
      </Popconfirm>
      <Popconfirm placement="bottom" title="向下弹出">
        <template #trigger>
          <Button variant="secondary">bottom</Button>
        </template>
      </Popconfirm>
      <Popconfirm placement="left" title="向左弹出">
        <template #trigger>
          <Button variant="secondary">left</Button>
        </template>
      </Popconfirm>
      <Popconfirm placement="right" title="向右弹出">
        <template #trigger>
          <Button variant="secondary">right</Button>
        </template>
      </Popconfirm>
    </div>
    <p class="demo-hint">
      placement 按触发元素 rect 定位（与气泡间距走 --ui-space-2）；不做视口碰撞翻转，
      打开期间滚动 / resize 跟随重排。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
  padding: var(--ui-space-5) 0;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
