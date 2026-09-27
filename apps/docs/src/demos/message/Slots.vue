<script setup lang="ts">
import { ref } from 'vue'
import { Button, Message } from '@ui/components'

const copied = ref(false)

/** 模拟复制反馈：真实场景里这里调用剪贴板 / 业务复制逻辑。 */
function copyReply(): void {
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>

<template>
  <div class="demo-stack">
    <Message role="assistant" name="纸面助手" timestamp="14:31">
      <template #avatar>
        <span class="brand-avatar" aria-hidden="true">纸</span>
      </template>
      <template #default="{ message }">
        已为你汇总完毕（role={{ message.role }}、streaming={{ message.streaming }}）。
        <span class="scope-note">—— default 插槽可读取作用域 message 的完整上下文</span>
      </template>
      <template #actions>
        <Button size="sm" variant="ghost" @click="copyReply">
          {{ copied ? '已复制' : '复制回复' }}
        </Button>
      </template>
    </Message>
    <p class="demo-hint">
      #avatar 覆盖内置头像（system 角色出现头像的唯一方式）；default 作用域暴露
      message 上下文（role/name/avatar/timestamp/streaming/status）；#actions 渲染气泡下方的操作行。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.brand-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-space-6);
  height: var(--ui-space-6);
  border-radius: calc(var(--ui-space-6) / 2);
  background-color: var(--ui-accent);
  color: var(--ui-on-accent);
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-small);
}

.scope-note {
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
