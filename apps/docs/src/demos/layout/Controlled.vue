<script setup lang="ts">
import { ref } from 'vue'
import { Button, Layout, LayoutContent, LayoutHeader, LayoutSider } from '@ui/components'

// 受控折叠：折叠态由使用方持有，组件只发 sider-collapse 通知，回写 collapsed 后视觉跟随
const collapsed = ref(false)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" variant="primary" @click="collapsed = !collapsed">
        {{ collapsed ? '展开侧栏' : '收起侧栏' }}
      </Button>
      <span class="demo-meta">当前 collapsed：{{ collapsed }}</span>
    </div>
    <Layout class="demo-page">
      <LayoutSider
        collapsible
        aria-label="主导航"
        :collapsed="collapsed"
        @sider-collapse="collapsed = $event"
      >
        <nav class="demo-nav">
          <span class="demo-nav__item">概览</span>
          <span class="demo-nav__item">部署</span>
          <span class="demo-nav__item">成员</span>
        </nav>
      </LayoutSider>
      <Layout>
        <LayoutHeader>
          <span class="demo-brand">受控折叠</span>
        </LayoutHeader>
        <LayoutContent>
          <p class="demo-body">
            外部按钮与侧栏内置触发器操作同一份状态：折叠态完全由 :collapsed 决定，
            组件不写内部态。
          </p>
        </LayoutContent>
      </Layout>
    </Layout>
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
  align-items: center;
  gap: var(--ui-space-3);
}

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
