<script setup lang="ts">
import { Button, ToastHost, toast } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" variant="primary" @click="toast.success('保存成功：更改已写入草稿')">success</Button>
      <Button size="sm" @click="toast.error('删除失败：网络中断，请重试')">error</Button>
      <Button size="sm" @click="toast.info('新版本已发布，刷新后生效')">info</Button>
      <Button size="sm" @click="toast.warning('草稿尚未保存，离开将丢失')">warning</Button>
    </div>
    <p class="demo-hint">
      <code>&lt;ToastHost /&gt;</code> 在应用入口挂载一次即可；此处为演示目的挂在本页。
      success 为 role=status，error 为 role=alert。
    </p>
    <ToastHost />
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
