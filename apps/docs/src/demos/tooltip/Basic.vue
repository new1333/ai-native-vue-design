<script setup lang="ts">
import { Button, Tooltip } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Tooltip>
        <Button variant="secondary">悬停或聚焦我</Button>
        <template #content>保存当前草稿（Ctrl + S）</template>
      </Tooltip>
      <Tooltip>
        <Button disabled>禁用按钮（不会触发）</Button>
        <template #content>禁用元素不响应鼠标与焦点事件，浮层自然不会出现</template>
      </Tooltip>
      <Tooltip placement="top">
        <Button variant="ghost">无 content 插槽</Button>
      </Tooltip>
    </div>
    <p class="demo-hint">
      hover / focus 进入后延迟 150ms 显示，移开立即隐藏；无 <code>#content</code>
      插槽时永不弹层。触发元素不产生包装 DOM，交互监听与 aria-describedby 直接合并到元素上。
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
