<script setup lang="ts">
import { h, ref } from 'vue'
import type { Component, VNode } from 'vue'
import { DropdownMenu } from '@ui/components'
import type { DropdownMenuItem } from '@ui/components'

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

const EditIcon: Component = svgIcon([
  h('path', { d: 'M12 20h9' }),
  h('path', { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' }),
])

const CopyIcon: Component = svgIcon([
  h('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2' }),
  h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }),
])

const TrashIcon: Component = svgIcon([
  h('path', { d: 'M3 6h18' }),
  h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }),
  h('path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
])

const items: DropdownMenuItem[] = [
  { key: 'edit', label: '编辑', icon: EditIcon },
  { key: 'copy', label: '复制', icon: CopyIcon },
  { key: 'share', label: '分享', disabled: true },
  { key: 'delete', label: '删除', icon: TrashIcon, danger: true },
]

const lastKey = ref<string | null>(null)

function onSelect(key: string): void {
  lastKey.value = key
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <DropdownMenu :items="items" @select="onSelect">更多操作</DropdownMenu>
    </div>
    <p class="demo-hint">
      disabled 项原生 disabled（text-3 弱化、不可选中、roving focus 跳过）；danger
      项以 danger 色呈现并按惯例置于末位；icon 传内联 SVG 组件，宽度高度由组件统一约束。
      最近选中：<code>{{ lastKey ?? '尚未选择' }}</code>（disabled 项不会触发 select）。
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
