<script setup lang="ts">
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@ui/components'

const current = ref('home')
</script>

<template>
  <div class="demo-stack">
    <div class="demo-bar">
      <Menu v-model:model-value="current" mode="horizontal" aria-label="站点主导航">
        <MenuItem value="home">首页</MenuItem>
        <MenuItem value="pricing">定价</MenuItem>
        <SubMenu value="docs" title="文档">
          <MenuItem value="guide">使用指南</MenuItem>
          <MenuItem value="api">API 参考</MenuItem>
        </SubMenu>
        <SubMenu value="about" title="关于">
          <MenuItem value="team">团队</MenuItem>
          <MenuItem value="contact">联系我们</MenuItem>
        </SubMenu>
      </Menu>
    </div>
    <p class="demo-hint">
      mode="horizontal"：顶栏横向排布，子菜单点击后向下弹出（纯 CSS 定位，--ui-z-dropdown 层级）；
      ↑↓←→ 均可在项间移动 roving 焦点。当前激活项：{{ current }}
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-bar {
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background-color: var(--ui-surface);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
