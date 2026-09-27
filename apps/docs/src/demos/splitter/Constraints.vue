<script setup lang="ts">
import { Splitter, SplitterPane } from '@ui/components'

// 约束按面板顺序对位：侧栏 min 20% / max 60% 且可折叠；主区不设约束
const panes = [
  { min: 20, max: 60, collapsible: true, label: '侧栏尺寸' },
  {},
]
</script>

<template>
  <div class="demo-stack">
    <Splitter class="demo-splitter" :panes="panes">
      <SplitterPane key="sidebar">
        <div class="demo-pane demo-pane--soft">
          <h4 class="demo-heading">侧栏</h4>
          <p>宽度被限制在 20%–60%。把分隔条向左拖过吸附阈值（min 的一半）即折叠为 0。</p>
        </div>
      </SplitterPane>
      <SplitterPane key="main">
        <div class="demo-pane">
          <h4 class="demo-heading">主区</h4>
          <p>折叠后：把分隔条向回拖拽，或在分隔条上按 Enter 恢复折叠前的位置。</p>
        </div>
      </SplitterPane>
    </Splitter>
    <p class="demo-hint">键盘：Tab 聚焦分隔条 → ← / → 每次 ±1%，Home / End 调到最小 / 最大位置，Enter 折叠 / 恢复（仅 collapsible 面板）。</p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

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

.demo-pane--soft {
  background: var(--ui-accent-soft);
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

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-3);
}
</style>
