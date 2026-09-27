<script setup lang="ts">
import { Button, Popover } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popover>
        <template #trigger>
          <Button variant="secondary">click 触发（默认）</Button>
        </template>
        <p class="demo-card-text">点击开合；Esc 或点击气泡之外区域关闭。</p>
      </Popover>
      <Popover trigger="hover" placement="bottom">
        <template #trigger>
          <Button variant="secondary">hover 触发</Button>
        </template>
        <p class="demo-card-text">进入 150ms 后开启，移出 150ms 后关闭；指针移入气泡不关闭。</p>
        <Button variant="ghost">气泡内按钮（可停留交互）</Button>
      </Popover>
      <Popover trigger="hover" placement="right">
        <template #trigger>
          <button type="button" class="demo-native-trigger">hover + 原生元素</button>
        </template>
        hover 模式下键盘聚焦触发元素（Tab）同样开启，与鼠标路径同构。
      </Popover>
    </div>
    <p class="demo-hint">
      hover 模式的焦点路径（focusin / focusout）与鼠标同构；焦点移入气泡（Tab 进入内容）不会关闭。
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
  align-items: flex-start;
}

.demo-native-trigger {
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  cursor: pointer;
}

.demo-card-text {
  margin: 0 0 var(--ui-space-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
