<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@ui/components'

const keyword = ref('纸面设计系统')
const clearCount = ref(0)
</script>

<template>
  <div class="demo-stack">
    <Input
      v-model="keyword"
      placeholder="搜索文档"
      :maxlength="20"
      clearable
      @clear="clearCount++"
    />
    <p class="demo-hint">
      当前值：<code>{{ keyword === '' ? '（空字符串）' : keyword }}</code>（{{ keyword.length }}/20），
      clear 已触发 <code>{{ clearCount }}</code> 次
      （有值且非禁用/只读时才显示清空按钮：点击发出 update:modelValue('') 与 clear，焦点交还输入框；
      maxlength 由浏览器原生截断）
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
