<script setup lang="ts">
import { Divider } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <p class="demo-text">上方章节：表单分组、卡片区块或页面章节内容。</p>
    <Divider />
    <p class="demo-text">下方章节：水平方向是默认值，渲染语义 hr，上下间距由组件内置。</p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
}

.demo-text {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}
</style>
