<script setup lang="ts">
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@ui/components'

const current = ref('articles')
</script>

<template>
  <div class="demo-stack">
    <Menu v-model:model-value="current">
      <MenuItem value="home">首页</MenuItem>
      <SubMenu value="library" title="内容库">
        <MenuItem value="articles">文章</MenuItem>
        <SubMenu value="media" title="媒体">
          <MenuItem value="images">图片</MenuItem>
          <MenuItem value="videos">视频</MenuItem>
        </SubMenu>
        <MenuItem value="audio" disabled>音频（禁用）</MenuItem>
      </SubMenu>
      <SubMenu value="archive" title="已归档（禁用组）" disabled>
        <MenuItem value="old">旧内容（不可见）</MenuItem>
      </SubMenu>
      <MenuItem value="settings">设置</MenuItem>
    </Menu>
    <p class="demo-hint">
      SubMenu 可嵌套：点击 / Enter / Space 展开，Esc 收起最近一层并回焦触发器；
      方向键 ←→↑↓ 在「可见可用」项间移动焦点（收起组内项被跳过），Enter 只激活叶子项。
      当前激活项：{{ current }}
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
