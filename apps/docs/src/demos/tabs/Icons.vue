<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Tabs default-value="database">
      <TabsList aria-label="服务依赖">
        <TabsTrigger value="gateway">
          <svg
            class="demo-trigger-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
          </svg>
          网关
        </TabsTrigger>
        <TabsTrigger value="database">
          <svg
            class="demo-trigger-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
          </svg>
          数据库
        </TabsTrigger>
        <TabsTrigger value="cache">
          <svg
            class="demo-trigger-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          缓存
        </TabsTrigger>
      </TabsList>
      <TabsContent value="gateway">网关服务：入站流量与限流。</TabsContent>
      <TabsContent value="database">数据库：主从状态与慢查询。</TabsContent>
      <TabsContent value="cache">缓存：命中率与淘汰策略。</TabsContent>
    </Tabs>
    <p class="demo-hint">
      图标走 TabsTrigger 的默认插槽（内联 SVG：viewBox 0 0 24 24、stroke-width 1.5、currentColor，
      aria-hidden 交给文本作可读名）；插槽内也可放任意行内内容，但应始终保留可读 label。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-trigger-icon {
  flex: none;
  width: var(--ui-space-4);
  height: var(--ui-space-4);
  margin-right: var(--ui-space-1);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
