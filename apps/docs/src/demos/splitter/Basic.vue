<script setup lang="ts">
import { Splitter, SplitterPane } from '@ui/components'
</script>

<template>
  <Splitter class="demo-splitter">
    <SplitterPane key="chat">
      <div class="demo-pane demo-pane--muted">
        <h4 class="demo-heading">对话</h4>
        <p>拖拽中间分隔条可调整两侧宽度；分隔条可聚焦，用 ← / → 每次 ±1% 微调。</p>
      </div>
    </SplitterPane>
    <SplitterPane key="artifact">
      <div class="demo-pane">
        <h4 class="demo-heading">产物预览</h4>
        <p>AI 生成的工作产物（文档 / 代码 / 图表）在此侧展示。</p>
      </div>
    </SplitterPane>
  </Splitter>
</template>

<style scoped>
/* 容器高度由使用方决定：这里用间距 token 的倍数派生，避免裸值 */
.demo-splitter {
  height: calc(var(--ui-space-8) * 3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  overflow: hidden;
}

.demo-pane {
  box-sizing: border-box;
  height: 100%;
  padding: var(--ui-space-4);
  background: var(--ui-surface);
}

.demo-pane--muted {
  background: var(--ui-surface-muted);
}

.demo-heading {
  margin: 0 0 var(--ui-space-2);
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.demo-pane p {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}
</style>
