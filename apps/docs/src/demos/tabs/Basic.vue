<script setup lang="ts">
import { ref } from 'vue'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components'
import type { TabsValue } from '@ui/components'

const active = ref<TabsValue>('overview')

function showMembers(): void {
  active.value = 'members'
}
</script>

<template>
  <div class="demo-stack">
    <Tabs v-model:value="active">
      <TabsList aria-label="项目详情">
        <TabsTrigger value="overview">概览</TabsTrigger>
        <TabsTrigger value="members">成员</TabsTrigger>
        <TabsTrigger value="settings">设置</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">概览面板：只有激活的面板会渲染（v-if），重面板可借此天然懒加载。</TabsContent>
      <TabsContent value="members">成员面板：TabsTrigger 与 TabsContent 以同名 value 配对。</TabsContent>
      <TabsContent value="settings">设置面板：tab / tabpanel 的互指 id 由根 uid + value 确定性派生。</TabsContent>
    </Tabs>
    <div class="demo-actions">
      <Button size="sm" :variant="active === 'members' ? 'primary' : 'secondary'" @click="showMembers">
        编程式切到「成员」
      </Button>
    </div>
    <p class="demo-hint">
      当前激活值：<code>{{ active }}</code>（v-model:value 受控，value 支持 string | number；
      键盘 ←→↑↓ 在 trigger 间移动即激活，Home / End 直达首末）
    </p>
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
  flex-wrap: wrap;
  gap: var(--ui-space-2);
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
