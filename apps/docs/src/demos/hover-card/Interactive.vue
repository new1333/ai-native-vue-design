<script setup lang="ts">
import { ref } from 'vue'
import { Button, HoverCard } from '@ui/components'

// 演示：卡片内按钮可正常点击（真实场景跳转详情页）
const clickCount = ref(0)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <HoverCard placement="bottom">
        <template #trigger>
          <a href="#interactive" class="demo-link">《纸面排版手记》</a>
        </template>
        <div class="demo-item">
          <p class="demo-item-title">纸面排版手记 · 第二版</p>
          <p class="demo-item-meta">更新于 3 天前 · 12 个章节 · 8 位协作者</p>
          <p class="demo-item-desc">
            指针移入预览卡不会关闭（closeDelay 宽限内移入即取消收起），卡片内的链接与按钮可正常交互。
          </p>
          <Button variant="ghost" @click="clickCount++">查看详情（已点击 {{ clickCount }} 次）</Button>
        </div>
      </HoverCard>
      <p class="demo-follow">↑ 悬停链接展开条目预览</p>
    </div>
    <p class="demo-hint">
      与 Tooltip 的本质差异：预览卡可停留、可交互（pointer-events:auto）。键盘 Tab 进入卡片内容
      同样保持打开；Esc 立即收起并把焦点还原到触发元素。
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

.demo-link {
  color: var(--ui-accent);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
}

.demo-follow {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-item {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  align-items: flex-start;
}

.demo-item-title {
  margin: 0;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.demo-item-meta {
  margin: 0;
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.demo-item-desc {
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
