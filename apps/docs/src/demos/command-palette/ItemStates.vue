<script setup lang="ts">
import { h, ref } from 'vue'
import type { Component, VNode } from 'vue'
import { CommandPalette } from '@ui/components'
import type { CommandPaletteGroup } from '@ui/components'

/** 内联 SVG 图标组件（viewBox 0 0 24 24、stroke-width 1.5、currentColor；渲染尺寸由组件约束为 16px）。 */
function svgIcon(paths: VNode[]): Component {
  return () =>
    h(
      'svg',
      {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
        focusable: 'false',
      },
      paths,
    )
}

const PencilIcon: Component = svgIcon([h('path', { d: 'M12 20h9' }), h('path', { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' })])
const TrashIcon: Component = svgIcon([
  h('path', { d: 'M3 6h18' }),
  h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }),
  h('path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
])

/** 聚焦命令状态呈现（hotkey=false）：点「打开面板」后体验各状态。 */
const open = ref(false)
const lastKey = ref<string | null>(null)

const groups: CommandPaletteGroup[] = [
  {
    key: 'doc',
    label: '文档操作',
    items: [
      { key: 'rename', label: '重命名', hint: 'F2', icon: PencilIcon },
      { key: 'share', label: '分享（未发布，暂不可用）', disabled: true },
      { key: 'delete', label: '删除文档', hint: '⌘⌫', icon: TrashIcon, danger: true },
    ],
  },
]

function onSelect(key: string): void {
  lastKey.value = key
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <button type="button" class="demo-button" @click="open = true">打开面板</button>
      <span class="demo-state">最近执行：{{ lastKey ?? '尚未选择' }}</span>
    </div>
    <p class="demo-hint">
      本例用 <code>#header</code> 插槽为面板提供标题（同时充当 dialog 的可访问名称），
      用 <code>#item</code> 插槽接管命令项渲染（scope：<code>command</code> /
      <code>active</code>，激活项以 accent 强调）。disabled 命令弱化且键盘漫游跳过、
      不可执行；danger 命令以 danger 色呈现、激活时 danger 柔底。
    </p>
    <CommandPalette v-model="open" :groups="groups" :hotkey="false" @select="onSelect">
      <template #header>文档操作</template>
      <template #item="{ command, active }">
        <span class="demo-item" :class="{ 'demo-item--active': active }">
          <span>{{ command.label }}</span>
          <span v-if="command.hint" class="demo-item-hint">{{ command.hint }}</span>
        </span>
      </template>
    </CommandPalette>
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

.demo-button {
  /* 描边宽度 1px 为结构性细线 */
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  padding: var(--ui-space-2) var(--ui-space-3);
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  cursor: pointer;
}

.demo-button:hover {
  border-color: var(--ui-border-strong);
  background-color: var(--ui-surface-muted);
}

.demo-state {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-item {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  font-weight: var(--ui-font-weight-regular);
}

.demo-item--active {
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.demo-item-hint {
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
