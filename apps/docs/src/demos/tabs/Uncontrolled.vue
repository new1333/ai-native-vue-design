<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <Tabs default-value="all">
      <TabsList aria-label="收件箱筛选">
        <TabsTrigger value="all">全部</TabsTrigger>
        <TabsTrigger value="unread">未读</TabsTrigger>
        <TabsTrigger value="archived">已归档</TabsTrigger>
      </TabsList>
      <TabsContent value="all">全部邮件。</TabsContent>
      <TabsContent value="unread">未读邮件。</TabsContent>
      <TabsContent value="archived">已归档邮件。</TabsContent>
    </Tabs>
    <p class="demo-hint">
      只给初始值 default-value="all"，后续切换在组件内部维护；
      缺省 defaultValue 时自动激活首个非 disabled 的 trigger。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
