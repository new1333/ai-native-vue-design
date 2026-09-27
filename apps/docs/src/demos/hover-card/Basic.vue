<script setup lang="ts">
import { Avatar, HoverCard } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <HoverCard placement="bottom">
        <template #trigger>
          <button type="button" class="demo-mention">@林晚晴</button>
        </template>
        <div class="demo-profile">
          <Avatar name="林晚晴" alt="林晚晴的头像" size="lg" />
          <div class="demo-profile-body">
            <p class="demo-profile-name">林晚晴</p>
            <p class="demo-profile-meta">产品设计师 · 纸面设计系统</p>
            <p class="demo-profile-bio">关注 AI-native 界面语言与排版节奏，写组件也写文档。</p>
          </div>
        </div>
      </HoverCard>
      <HoverCard>
        <template #trigger>
          <button type="button" disabled class="demo-mention demo-mention--disabled">@已注销用户</button>
        </template>
        <p class="demo-card-text">禁用触发元素不派发鼠标与焦点事件，预览卡不会出现。</p>
      </HoverCard>
      <HoverCard>
        <template #trigger>
          <button type="button" class="demo-mention">无内容插槽</button>
        </template>
      </HoverCard>
    </div>
    <p class="demo-hint">
      trigger 插槽放唯一触发元素（无包装 DOM），default 插槽即预览卡内容；hover / focus 进入
      150ms 后开启、移出 150ms 后收起。未提供 default 插槽或触发元素禁用时不会弹卡。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}

.demo-mention {
  border: none;
  background: none;
  padding: 0;
  color: var(--ui-accent);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  cursor: pointer;
}

.demo-mention--disabled {
  color: var(--ui-text-3);
  cursor: not-allowed;
}

.demo-profile {
  display: flex;
  gap: var(--ui-space-3);
  align-items: flex-start;
}

.demo-profile-body {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}

.demo-profile-name {
  margin: 0;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.demo-profile-meta {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-profile-bio {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.demo-card-text {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
