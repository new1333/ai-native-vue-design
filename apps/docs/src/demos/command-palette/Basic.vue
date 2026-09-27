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

const HomeIcon: Component = svgIcon([h('path', { d: 'M3 10.5 12 3l9 7.5' }), h('path', { d: 'M5 9.5V21h14V9.5' })])
const DocsIcon: Component = svgIcon([
  h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
  h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' }),
])
const LinkIcon: Component = svgIcon([
  h('path', { d: 'M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5' }),
  h('path', { d: 'M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5' }),
])

const open = ref(false)
const lastKey = ref<string | null>(null)

const groups: CommandPaletteGroup[] = [
  {
    key: 'nav',
    label: '导航',
    items: [
      { key: 'home', label: '回到首页', hint: 'G H', icon: HomeIcon },
      { key: 'docs', label: '打开文档', hint: 'G D', icon: DocsIcon },
    ],
  },
  {
    key: 'action',
    label: '操作',
    items: [{ key: 'copy-link', label: '复制页面链接', hint: '⌘C', icon: LinkIcon }],
  },
]

function onSelect(key: string): void {
  lastKey.value = key
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <button type="button" class="demo-button" @click="open = true">
        打开命令面板
        <kbd class="demo-kbd">⌘K</kbd>
      </button>
    </div>
    <p class="demo-hint">
      本页全局注册了 Cmd/Ctrl+K（hotkey 默认 true，仅客户端监听）：任意位置按下即可开合本示例的面板。
      面板内 ↓ / ↑ 环绕漫游（跳过禁用项）、Home / End 首尾、Enter 执行；Esc 关闭并还原焦点。
      最近执行：<code>{{ lastKey ?? '尚未选择' }}</code>（选中后组件发出
      <code>update:modelValue=false</code>，v-model 自动落账关闭）。
    </p>
    <CommandPalette v-model="open" :groups="groups" @select="onSelect" />
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
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
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

.demo-kbd {
  padding: 0 var(--ui-space-1);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xs);
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
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
