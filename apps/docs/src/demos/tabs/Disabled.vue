<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components'

const active = ref('inbox')
</script>

<template>
  <div class="demo-stack">
    <Tabs v-model:value="active">
      <TabsList aria-label="消息筛选">
        <TabsTrigger value="inbox">收件箱</TabsTrigger>
        <TabsTrigger value="unread" disabled>未读（禁用）</TabsTrigger>
        <TabsTrigger value="starred">星标</TabsTrigger>
      </TabsList>
      <TabsContent value="inbox">收件箱消息。</TabsContent>
      <TabsContent value="unread">这个面板不会被看到：disabled 的 trigger 无法被点击或键盘激活。</TabsContent>
      <TabsContent value="starred">星标消息。</TabsContent>
    </Tabs>
    <p class="demo-hint">
      disabled 用原生 disabled：移出 Tab 序，点击与 Enter / Space 激活被拦截；
      方向键导航跳过它——焦点在「收件箱」时按 → 直达「星标」。
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
