<script setup lang="ts">
import { ref } from 'vue'
import { CommandPalette } from '@ui/components'
import type { CommandPaletteGroup } from '@ui/components'

/** 搜索过滤与无结果态（hotkey=false）：点「打开面板」后在搜索框输入体验过滤。 */
const open = ref(false)
const lastKey = ref<string | null>(null)

const groups: CommandPaletteGroup[] = [
  {
    key: 'navigate',
    label: '跳转',
    items: [
      { key: 'projects', label: '项目列表' },
      { key: 'members', label: '成员管理' },
      { key: 'billing', label: '账单中心' },
    ],
  },
  {
    key: 'create',
    label: '新建',
    items: [
      { key: 'new-doc', label: '新建文档' },
      { key: 'new-issue', label: '新建议题' },
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
      过滤规则：对命令 label 做不区分大小写的子串匹配；组内命令全部未命中时整组隐藏；
      过滤后激活项自动回到首个启用命令。全部未命中时渲染 <code>#empty</code>
      插槽（缺省为「无匹配命令」）——试试输入一个不存在的词。
    </p>
    <CommandPalette
      v-model="open"
      :groups="groups"
      :hotkey="false"
      @select="onSelect"
    >
      <template #empty>没有找到命令，换个关键词试试</template>
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
