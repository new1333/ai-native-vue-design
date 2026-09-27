<script setup lang="ts">
import { Button, Popconfirm } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popconfirm
        title="键盘路径演示"
        description="打开后焦点先落在「取消」，Tab 到「确认」，Esc 关闭并把焦点还原到触发元素。"
      >
        <template #trigger>
          <Button variant="secondary">Tab 聚焦后按 Enter 打开</Button>
        </template>
      </Popconfirm>

      <Popconfirm title="这个触发元素已禁用" description="原生 disabled 不响应点击，气泡不会弹出。">
        <template #trigger>
          <button type="button" class="demo-disabled-trigger" disabled>已禁用的触发元素</button>
        </template>
      </Popconfirm>

      <Popconfirm>
        <template #trigger>
          <Button variant="ghost">无标题且无描述（不会弹层）</Button>
        </template>
      </Popconfirm>
    </div>
    <p class="demo-hint">
      气泡为非模态 role="dialog"（aria-labelledby 指向标题，描述经 aria-describedby 关联）；
      确认/取消是原生 button（Enter/Space 原生语义）。title 与 description 都未提供时不弹层。
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

/* 禁用触发元素：native button disabled，视觉做弱化处理（全部走 token） */
.demo-disabled-trigger {
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  color: var(--ui-text-3);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  cursor: not-allowed;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
