<script setup lang="ts">
import { Layout, LayoutContent, LayoutFooter, LayoutHeader } from '@ui/components'
</script>

<template>
  <Layout class="demo-page">
    <LayoutHeader>
      <span class="demo-brand">纸面控制台</span>
      <span class="demo-meta">纵向骨架：顶栏 + 主内容 + 页脚</span>
    </LayoutHeader>
    <LayoutContent>
      <p class="demo-title">部署概览</p>
      <p class="demo-body">主内容区填充剩余空间（flex: 1），顶栏与页脚保持固定高度。</p>
    </LayoutContent>
    <LayoutFooter>© 2026 纸面 Paper</LayoutFooter>
  </Layout>
</template>

<style scoped>
.demo-page {
  height: calc(var(--ui-space-8) * 6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  overflow: hidden;
}

.demo-brand {
  font-weight: var(--ui-font-weight-semibold);
}

.demo-meta {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-title {
  margin: 0 0 var(--ui-space-2);
  font-size: var(--ui-text-xl);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
}

.demo-body {
  margin: 0;
  color: var(--ui-text-2);
}
</style>
