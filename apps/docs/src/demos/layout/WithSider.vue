<script setup lang="ts">
import { Layout, LayoutContent, LayoutFooter, LayoutHeader, LayoutSider } from '@ui/components'
</script>

<template>
  <Layout class="demo-page">
    <LayoutSider aria-label="主导航">
      <nav class="demo-nav">
        <span class="demo-nav__item demo-nav__item--active">概览</span>
        <span class="demo-nav__item">部署</span>
        <span class="demo-nav__item">成员</span>
        <span class="demo-nav__item">设置</span>
      </nav>
    </LayoutSider>
    <Layout>
      <LayoutHeader>
        <span class="demo-brand">工作台</span>
      </LayoutHeader>
      <LayoutContent>
        <p class="demo-title">SaaS 经典壳</p>
        <p class="demo-body">
          外层 Layout 的直接子节点含 LayoutSider 时自动切横向；右侧嵌套一层 Layout
          承载纵向的顶栏 / 内容 / 页脚。
        </p>
      </LayoutContent>
      <LayoutFooter>最近同步于 5 分钟前</LayoutFooter>
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

.demo-nav__item--active {
  background: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.demo-brand {
  font-weight: var(--ui-font-weight-semibold);
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
