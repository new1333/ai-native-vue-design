<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog } from '@ui/components'

const open = ref(false)

const changelog: string[] = [
  '0.9.0 —— Dialog / Tooltip / DropdownMenu 三个浮层族组件发布',
  '0.8.2 —— Table 数字列对齐应用 tabular-nums',
  '0.8.1 —— Select 键盘漫游跳过 disabled 项',
  '0.8.0 —— Tabs 支持手势滚动的标签条',
  '0.7.3 —— Form 校验时机与 aria-invalid 关联修正',
  '0.7.2 —— Input 可清空按钮焦点交还输入框',
  '0.7.1 —— Badge dot 圆点与文本基线对齐',
  '0.7.0 —— EmptyState 支持自定义动作插槽',
  '0.6.4 —— Skeleton 数量与密度档位对齐标尺',
  '0.6.3 —— Progress 轨道与指示条对比度修正',
  '0.6.2 —— Alert 图标与正文间距统一',
  '0.6.1 —— Pagination 页码溢出折叠策略调整',
]
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="open = true">查看更新日志</Button>
    </div>
    <p class="demo-hint">
      <code>#title</code> 插槽覆盖 <code>title</code> prop，内容同样渲染进
      aria-labelledby 指向的标题元素；正文超高时 body 区内部滚动。
    </p>
    <Dialog v-model="open" size="lg">
      <template #title>
        更新日志 <span class="demo-title-note">节选</span>
      </template>
      <ul class="demo-changelog">
        <li v-for="entry in changelog" :key="entry">{{ entry }}</li>
      </ul>
    </Dialog>
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

.demo-title-note {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-regular);
  color: var(--ui-text-3);
}

.demo-changelog {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
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
