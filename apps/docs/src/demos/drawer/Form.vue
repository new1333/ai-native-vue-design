<script setup lang="ts">
import { ref } from 'vue'
import { Button, Checkbox, Drawer } from '@ui/components'

const options = ['草稿', '待评审', '已发布'] as const

const open = ref(false)
const saved = ref<string[]>([])
const draft = ref<Record<(typeof options)[number], boolean>>({
  草稿: false,
  待评审: false,
  已发布: false,
})

function openDrawer(): void {
  for (const option of options) draft.value[option] = saved.value.includes(option)
  open.value = true
}

function reset(): void {
  for (const option of options) draft.value[option] = false
}

function apply(): void {
  saved.value = options.filter(option => draft.value[option])
  open.value = false
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="openDrawer">打开筛选面板</Button>
      <span class="demo-hint">已应用筛选：{{ saved.length > 0 ? saved.join('、') : '无' }}</span>
    </div>
    <p class="demo-hint">
      表单模式：<code>:close-on-scrim="false"</code> 拦截遮罩误触，关闭必须走 footer 里的明确动作；
      footer 插槽整体接管底部动作区（「重置 + 应用」成对，一个 footer 只放一个 primary）。
    </p>
    <Drawer v-model="open" side="left" size="sm" :close-on-scrim="false">
      <template #header>筛选文章状态</template>
      <div class="demo-options">
        <Checkbox v-for="option in options" :key="option" v-model="draft[option]" :label="option" />
      </div>
      <template #footer>
        <Button @click="reset">重置</Button>
        <Button variant="primary" @click="apply">应用</Button>
      </template>
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
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-options {
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
