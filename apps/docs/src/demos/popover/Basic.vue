<script setup lang="ts">
import { Button, Popover } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popover>
        <template #trigger>
          <Button variant="secondary">点击展开补充说明</Button>
        </template>
        <p class="demo-card-title">补充说明</p>
        <p class="demo-card-text">
          气泡卡片可以承载任意内容：文字、链接、按钮都可以。点击气泡之外区域或按 Esc 关闭，焦点回到触发元素。
        </p>
      </Popover>
      <Popover placement="bottom">
        <template #trigger>
          <button type="button" class="demo-native-trigger">原生元素触发器</button>
        </template>
        一句话的气泡内容。原生 button / a 等元素同样直接作为触发元素，不产生包装 DOM。
      </Popover>
    </div>
    <p class="demo-hint">
      默认点击开合（trigger=click）；未提供 default 插槽时不会弹层。
      触发元素恒挂 <code>aria-expanded</code>，打开时挂 <code>aria-controls</code> 指向气泡。
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

.demo-card-title {
  margin: 0 0 var(--ui-space-1);
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.demo-card-text {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
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
