<script setup lang="ts">
import { Layout, LayoutContent, LayoutHeader, LayoutSider } from '@ui/components'
</script>

<template>
  <Layout class="demo-page">
    <LayoutSider collapsible breakpoint="md" aria-label="主导航">
      <nav class="demo-nav">
        <span class="demo-nav__item">概览</span>
        <span class="demo-nav__item">部署</span>
        <span class="demo-nav__item">成员</span>
      </nav>
    </LayoutSider>
    <Layout>
      <LayoutHeader>
        <span class="demo-brand">响应式侧栏</span>
        <span class="demo-meta">breakpoint="md"（视口低于 992px 命中）</span>
      </LayoutHeader>
      <LayoutContent>
        <p class="demo-body">
          拖窄浏览器窗口至 992px 以下：侧栏自动折叠；回到以上自动展开。
          断点接线在客户端挂载后进行（matchMedia），SSR 输出保持初始态。
        </p>
      </LayoutContent>
    </Layout>
  </Layout>
</template>

<style scoped>
.demo-page {
  height: calc(var(--ui-space-8) * 6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  overflow: hidden;
}

.demo-nav {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  padding: var(--ui-space-3);
}

.demo-nav__item {
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-brand {
  font-weight: var(--ui-font-weight-semibold);
}

.demo-meta {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-body {
  margin: 0;
  color: var(--ui-text-2);
}
</style>
