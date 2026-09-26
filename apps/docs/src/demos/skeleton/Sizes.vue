<script setup lang="ts">
import { Skeleton } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-block">
      <p class="demo-hint">
        circle：width 作正圆直径（:width='40' / :width='64'）；仅缺 width 时用 height 兜底（:height='56'）
      </p>
      <div class="demo-row">
        <Skeleton variant="circle" :width="40" :height="40" />
        <Skeleton variant="circle" :width="64" />
        <Skeleton variant="circle" :height="56" />
      </div>
    </div>
    <div class="demo-block">
      <p class="demo-hint">rect：字符串原样（width='100%'）、数字按 px（:height='96'）</p>
      <Skeleton variant="rect" width="100%" :height="96" />
      <Skeleton variant="rect" :width="160" :height="24" />
    </div>
    <div class="demo-block">
      <p class="demo-hint">line：width='50%' 控制整组行宽</p>
      <Skeleton width="50%" />
    </div>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-block {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
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
