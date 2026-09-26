<script setup lang="ts">
import { Skeleton } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-loading" role="status" aria-label="内容加载中">
      <div class="demo-media">
        <Skeleton variant="rect" width="100%" height="96px" />
        <Skeleton :lines="2" />
      </div>
      <div v-for="i in 3" :key="i" class="demo-item">
        <Skeleton variant="circle" :width="36" :height="36" />
        <div class="demo-item__text">
          <Skeleton :lines="2" />
        </div>
      </div>
    </div>
    <p class="demo-hint">
      形状贴近真实内容：媒体区用 rect、正文用 line、头像用 circle；加载语义同样由使用方容器声明。
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
  gap: var(--ui-space-5);
}

.demo-media {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-item {
  display: flex;
  gap: var(--ui-space-3);
  align-items: center;
}

.demo-item__text {
  flex: 1 1 auto;
  min-width: 0;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
