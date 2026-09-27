<script setup lang="ts">
import { ref } from 'vue'
import { Button, EmptyState, MessageList } from '@ui/components'

/**
 * 分发模式：不传 messages，内容直接由默认插槽分发（列表结构与气泡渲染完全由使用方编排）。
 * 空态触发方式：不给默认插槽内容——下方用 v-if / v-else 在「有内容列表」与「空列表」间切换
 * （分发的空判定看默认插槽是否存在，故空态列表不渲染任何默认插槽子节点）。
 */
const hasContent = ref(true)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" :variant="hasContent ? 'primary' : 'secondary'" @click="hasContent = !hasContent">
        {{ hasContent ? '切换为空会话' : '恢复分发内容' }}
      </Button>
    </div>
    <p class="demo-readout">
      未传 messages：默认插槽内容原样进入滚动容器；无默认插槽内容时落入空态（此处用 #empty 自定义 EmptyState + 起始建议）。
    </p>

    <MessageList v-if="hasContent" class="demo-chat" aria-label="分发模式演示">
      <p class="demo-bubble demo-bubble--user">不用 messages prop 也可以吗？</p>
      <p class="demo-bubble demo-bubble--assistant">可以：默认插槽直接分发内容，适合列表结构完全由使用方编排的场景。</p>
      <p class="demo-bubble demo-bubble--user">空态怎么处理？</p>
      <p class="demo-bubble demo-bubble--assistant">不渲染默认插槽内容即可，配合 #empty 自定义空态。</p>
    </MessageList>
    <MessageList v-else class="demo-chat" aria-label="分发模式空态演示">
      <template #empty>
        <EmptyState title="还没有对话" description="从一个建议问题开始：">
          <template #action>
            <Button size="sm" variant="secondary">「帮我写一份周报」</Button>
          </template>
        </EmptyState>
      </template>
    </MessageList>

    <!-- 缺省空态：无任何插槽时自动渲染 EmptyState（title「暂无消息」） -->
    <MessageList class="demo-chat demo-chat--short" aria-label="默认空态演示" />
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
  gap: var(--ui-space-2);
}

.demo-readout {
  margin: 0;
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
}

.demo-chat {
  height: calc(var(--ui-space-8) * 3);
  padding: var(--ui-space-3) var(--ui-space-2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
}

.demo-chat--short {
  height: calc(var(--ui-space-8) * 2);
}

.demo-bubble {
  width: fit-content;
  max-width: calc(var(--ui-space-8) * 8);
  margin: 0 0 var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-md);
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}

.demo-bubble--user {
  margin-left: auto;
  background-color: var(--ui-accent-soft);
}

.demo-bubble--assistant {
  background-color: var(--ui-surface-muted);
}
</style>
