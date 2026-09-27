<script setup lang="ts">
import { ref } from 'vue'
import { Layout, LayoutContent, LayoutHeader, LayoutSider } from '@ui/components'

// 非受控折叠：组件内部维护状态，sider-collapse 仅用于监听（同值不重复发出）
const lastEvent = ref('尚未折叠')
</script>

<template>
  <Layout class="demo-page">
    <LayoutSider collapsible aria-label="主导航" @sider-collapse="lastEvent = $event ? '已折叠' : '已展开'">
      <nav class="demo-nav">
        <span class="demo-nav__item">概览</span>
        <span class="demo-nav__item">部署</span>
        <span class="demo-nav__item">成员</span>
      </nav>
    </LayoutSider>
    <Layout>
      <LayoutHeader>
        <span class="demo-brand">可折叠侧栏</span>
        <span class="demo-meta">最近事件：{{ lastEvent }}</span>
      </LayoutHeader>
      <LayoutContent>
        <p class="demo-body">
          点击侧栏底部的折叠触发器：侧栏在 256px 导航轨与 64px 折叠轨间过渡，
          事件以 sider-collapse（boolean）发出。
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
