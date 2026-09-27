<script setup lang="ts">
import { ref } from 'vue'
import { Button, Popconfirm } from '@ui/components'

const removed = ref(false)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popconfirm
        title="删除这条评论？"
        description="删除后不可恢复。"
        danger
        @confirm="removed = true"
        @cancel="removed = false"
      >
        <template #trigger>
          <Button variant="danger" :disabled="removed">删除评论</Button>
        </template>
      </Popconfirm>

      <Popconfirm title="清空回收站？" description="#icon 插槽替换内建警示图标。" danger>
        <template #trigger>
          <Button variant="ghost">自定义图标</Button>
        </template>
        <template #icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </template>
      </Popconfirm>
    </div>
    <p class="demo-hint">
      danger=true 时确认按钮走 destructive token（柔底 → hover 实底）、内建图标转危险色。
      左例确认后触发按钮进入禁用态（气泡不再弹出），取消可恢复。
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
</style>
