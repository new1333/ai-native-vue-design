<script setup lang="ts">
import { ref } from 'vue'
import { CommandPalette } from '@ui/components'
import type { CommandPaletteGroup } from '@ui/components'

/** 受控开合（:hotkey="false" 避免与其他示例的全局热键叠加）。 */
const open = ref(false)
const lastKey = ref<string | null>(null)

const groups: CommandPaletteGroup[] = [
  {
    key: 'page',
    label: '页面',
    items: [
      { key: 'overview', label: '总览' },
      { key: 'settings', label: '设置' },
    ],
  },
]

function onUpdateOpen(value: boolean): void {
  // 不用 v-model 的写法：显式落账（Esc / 遮罩 / 选中后的 update:modelValue 都会到达这里）
  open.value = value
}

function onSelect(key: string): void {
  lastKey.value = key
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <button type="button" class="demo-button" @click="open = true">打开</button>
      <button type="button" class="demo-button" @click="open = false">关闭</button>
      <span class="demo-state">状态：{{ open ? '已打开' : '已关闭' }}</span>
    </div>
    <p class="demo-hint">
      受控用法：外部持有 open 状态并以 <code>:model-value</code> +
      <code>@update:model-value</code> 显式落账（等价 v-model）；
      <code>:hotkey="false"</code> 关闭全局快捷键；placeholder 自定义搜索占位。
      Esc / 遮罩点击 / 选中命令都会发出 <code>update:modelValue=false</code>。
      最近执行：<code>{{ lastKey ?? '尚未选择' }}</code>。
    </p>
    <CommandPalette
      :model-value="open"
      :groups="groups"
      :hotkey="false"
      placeholder="输入命令或搜索…"
      @update:model-value="onUpdateOpen"
      @select="onSelect"
    />
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
