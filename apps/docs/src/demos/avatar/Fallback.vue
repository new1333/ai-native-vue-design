<script setup lang="ts">
import { Avatar } from '@ui/components'

/** 必然 404 的地址：触发 img 的 error 事件，演示加载失败自动回退。 */
const brokenSrc = '/docs-demo/avatar/not-exist.png'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Avatar name="Zhang San" alt="张三" />
      <Avatar name="纸面" alt="纸面设计" />
      <Avatar initials="AI" alt="AI 助手" size="lg" />
      <Avatar :src="brokenSrc" alt="李四" name="李四" size="lg" />
    </div>
    <p class="demo-hint">
      前两个由 name 推导（Zhang San → ZS、纸面 → 纸）；AI 来自显式 initials（优先于 name 推导）；
      最后一个 src 404 后自动回退（error 态），可读名称由 alt 承担。
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

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
