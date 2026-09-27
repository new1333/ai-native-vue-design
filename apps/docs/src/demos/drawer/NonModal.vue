<script setup lang="ts">
import { ref } from 'vue'
import { Button, Drawer } from '@ui/components'

const open = ref(false)
const clicks = ref(0)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="open = true">打开非模态抽屉</Button>
      <Button @click="clicks += 1">页面按钮（点击计数：{{ clicks }}）</Button>
    </div>
    <p class="demo-hint">
      <code>:modal="false"</code>：无遮罩、不锁定页面滚动、不移入/圈定焦点，
      抽屉打开时页面照常可交互（试试右边的计数按钮）；Esc 在焦点位于抽屉内时仍可关闭。
    </p>
    <Drawer v-model="open" :modal="false" side="right" size="sm">
      <template #header>并排工作区</template>
      <p>非模态抽屉与页面并存，适合设置面板、大纲目录这类需要边看边操作的场景。</p>
      <p>头部右侧仍有关闭按钮，点击即发出 update:modelValue false。</p>
    </Drawer>
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
