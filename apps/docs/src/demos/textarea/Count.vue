<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@ui/components'

const bio = ref('纸面 Paper：token 驱动的 AI-native 组件库。')
const comment = ref('')
</script>

<template>
  <div class="demo-stack">
    <Textarea v-model="bio" :rows="3" :maxlength="40" show-count />
    <Textarea v-model="comment" :rows="2" show-count placeholder="无 maxlength 时仅显示当前字数" />
    <p class="demo-hint">
      showCount 在容器右下角以弱文字显示字数：配 maxlength 为 x/y，无 maxlength 仅为 x；
      超长截断由浏览器原生 maxlength 完成。
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
