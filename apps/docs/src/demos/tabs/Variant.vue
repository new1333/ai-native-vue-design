<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-section">
      <p class="demo-label">variant="line"（默认：激活项带 accent 下划线指示）</p>
      <Tabs default-value="week">
        <TabsList aria-label="趋势区间">
          <TabsTrigger value="day">日</TabsTrigger>
          <TabsTrigger value="week">周</TabsTrigger>
          <TabsTrigger value="month">月</TabsTrigger>
        </TabsList>
        <TabsContent value="day">日视图。</TabsContent>
        <TabsContent value="week">周视图：底部 1px 基线 + 2px accent 下划线（inset 阴影实现，无布局位移）。</TabsContent>
        <TabsContent value="month">月视图。</TabsContent>
      </Tabs>
    </div>
    <div class="demo-section">
      <p class="demo-label">variant="pill"（预留档位：无下划线指示）</p>
      <Tabs variant="pill" default-value="week">
        <TabsList aria-label="趋势区间（pill）">
          <TabsTrigger value="day">日</TabsTrigger>
          <TabsTrigger value="week">周</TabsTrigger>
          <TabsTrigger value="month">月</TabsTrigger>
        </TabsList>
        <TabsContent value="day">日视图。</TabsContent>
        <TabsContent value="week">周视图：基底与 line 一致，但无下划线指示。</TabsContent>
        <TabsContent value="month">月视图。</TabsContent>
      </Tabs>
    </div>
    <p class="demo-hint">
      pill 为预留档位（类型已声明，视觉暂未实现），优先使用默认 line。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-label {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
