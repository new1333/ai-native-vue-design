<script setup lang="ts">
import { Splitter, SplitterPane } from '@ui/components'
</script>

<template>
  <Splitter class="demo-splitter" direction="vertical">
    <SplitterPane key="editor">
      <div class="demo-pane">
        <h4 class="demo-heading">编辑器</h4>
        <p>direction="vertical" 为上下分栏：分隔条为横线，用 ↑ / ↓ 键微调。</p>
      </div>
    </SplitterPane>
    <SplitterPane key="terminal">
      <div class="demo-pane demo-pane--muted">
        <h4 class="demo-heading">运行日志</h4>
        <p>两个面板的内容超出面板区域时，各自在面板内滚动。</p>
      </div>
    </SplitterPane>
  </Splitter>
</template>

<style scoped>
.demo-splitter {
  height: calc(var(--ui-space-8) * 4);
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
