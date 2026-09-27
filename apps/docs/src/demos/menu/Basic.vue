<script setup lang="ts">
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@ui/components'
import type { MenuValue } from '@ui/components'

const current = ref<MenuValue>('overview')
const lastSelected = ref('（尚未选择）')

function onSelect(value: MenuValue): void {
  lastSelected.value = String(value)
}

function goSettings(): void {
  current.value = 'settings'
}
</script>

<template>
  <div class="demo-stack">
    <Menu v-model:model-value="current" @select="onSelect">
      <MenuItem value="overview">概览</MenuItem>
      <SubMenu value="content" title="内容管理">
        <MenuItem value="articles">文章</MenuItem>
        <MenuItem value="media">媒体库</MenuItem>
      </SubMenu>
      <MenuItem value="settings">设置</MenuItem>
      <MenuItem value="trash" disabled>回收站（禁用）</MenuItem>
    </Menu>
    <div class="demo-actions">
      <button type="button" class="demo-button" @click="goSettings">编程式切到「设置」</button>
    </div>
    <p class="demo-hint">
      当前激活项：<code>{{ current }}</code>，最近一次 select：<code>{{ lastSelected }}</code>
      （v-model:modelValue 受控；disabled 项不可点击/键盘激活，方向键导航跳过）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-button {
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-border-strong);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
  cursor: pointer;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint code {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
