<script setup lang="ts">
import { Skeleton } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-loading" role="status" aria-label="内容加载中">
      <Skeleton :lines="3" />
      <div class="demo-row">
        <Skeleton variant="circle" :width="40" :height="40" />
        <Skeleton variant="rect" :width="160" :height="40" />
      </div>
    </div>
    <p class="demo-hint">
      line（默认，3 行）/ circle（正圆头像）/ rect（矩形块面）三档形状；Skeleton
      本体恒 aria-hidden，加载语义由使用方容器 role="status" 声明。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-loading {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-3);
  align-items: center;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
