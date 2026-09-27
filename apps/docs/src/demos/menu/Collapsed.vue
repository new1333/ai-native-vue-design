<script setup lang="ts">
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@ui/components'

const current = ref('home')
const collapsed = ref(true)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <button type="button" class="demo-button" @click="collapsed = !collapsed">
        {{ collapsed ? '展开为完整侧边栏' : '收起为图标栏' }}
      </button>
    </div>
    <div class="demo-shell">
      <Menu v-model:model-value="current" :collapsed="collapsed">
        <MenuItem value="home">
          <template #icon>
            <svg
              class="demo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="m3 11 9-8 9 8" />
              <path d="M5 10v10h14V10" />
            </svg>
          </template>
          首页
        </MenuItem>
        <SubMenu value="library" title="内容库">
          <template #icon>
            <svg
              class="demo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </template>
          <MenuItem value="articles">文章</MenuItem>
          <MenuItem value="media">媒体库</MenuItem>
        </SubMenu>
        <MenuItem value="settings">
          <template #icon>
            <svg
              class="demo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1m0-14.2-2.1 2.1m-10 10-2.1 2.1" />
            </svg>
          </template>
          设置
        </MenuItem>
      </Menu>
      <p class="demo-body">应用主体区域占位：collapsed 是侧边栏外壳的收起态。</p>
    </div>
    <p class="demo-hint">
      collapsed（仅 mode="vertical" 生效）：宽度收窄为图标栏，label 视觉隐藏但屏幕阅读器仍可读，
      子菜单向右侧飞出。收起态应为每项提供 #icon 图标。
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

.demo-shell {
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-5);
  padding: var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background-color: var(--ui-surface);
}

.demo-body {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
