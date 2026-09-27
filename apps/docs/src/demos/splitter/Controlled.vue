<script setup lang="ts">
import { ref } from 'vue'
import { Splitter, SplitterPane } from '@ui/components'
import type { SplitterCollapsePayload } from '@ui/components'

// 受控：sizes 是唯一事实来源，拖拽 / 键盘 / 按钮都会经 update:modelValue 回流
const sizes = ref<number[]>([60, 40])
const logs = ref<string[]>([])

function pushLog(text: string): void {
  logs.value = [text, ...logs.value].slice(0, 5)
}

function onResize(next: number[]): void {
  pushLog(`resize → ${next.map((n) => Math.round(n)).join(' / ')}`)
}

function onCollapse(payload: SplitterCollapsePayload): void {
  pushLog(`collapse → 面板 ${payload.index} ${payload.collapsed ? '折叠' : '展开'}`)
}

function collapseSidebar(): void {
  sizes.value = [0, 100]
}

function resetLayout(): void {
  sizes.value = [60, 40]
}
</script>

<template>
  <div class="demo-stack">
    <Splitter
      v-model="sizes"
      class="demo-splitter"
      :panes="[{ collapsible: true, label: '侧栏尺寸' }]"
      @resize="onResize"
      @collapse="onCollapse"
    >
      <SplitterPane key="chat">
        <div class="demo-pane demo-pane--muted">
          <h4 class="demo-heading">对话</h4>
          <p>面板比例由外层 sizes 数组驱动（当前 {{ Math.round(sizes[0]) }}% / {{ Math.round(sizes[1]) }}%）。</p>
        </div>
      </SplitterPane>
      <SplitterPane key="artifact">
        <div class="demo-pane">
          <h4 class="demo-heading">产物</h4>
          <p>受控模式下可整体替换数组（如持久化到 localStorage 后回填）。</p>
        </div>
      </SplitterPane>
    </Splitter>

    <div class="demo-actions">
      <button type="button" class="demo-btn" @click="collapseSidebar">折叠侧栏</button>
      <button type="button" class="demo-btn" @click="resetLayout">恢复 60 / 40</button>
    </div>

    <ul class="demo-logs">
      <li v-for="(log, i) in logs" :key="i" class="demo-log">{{ log }}</li>
      <li v-if="logs.length === 0" class="demo-log demo-log--empty">拖拽或按键盘后，resize / collapse 事件会记录在这里。</li>
    </ul>
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

.demo-actions {
  display: flex;
  gap: var(--ui-space-2);
}

.demo-btn {
  padding: var(--ui-space-1) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  color: var(--ui-text-1);
  font-size: var(--ui-text-sm);
  font-family: var(--ui-font-sans);
  cursor: pointer;
}

.demo-btn:hover {
  border-color: var(--ui-border-strong);
}

.demo-logs {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}

.demo-log {
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
  font-variant-numeric: var(--ui-numeric);
}

.demo-log--empty {
  color: var(--ui-text-3);
}
</style>
