<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { PromptInput } from '@ui/components'

const draft = ref('')
const reply = ref('')
const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

// 模拟流式生成：submit 后进入 loading，加载中按钮切换为停止（cancel）
function onSubmit(value: string): void {
  draft.value = ''
  reply.value = ''
  loading.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    loading.value = false
    reply.value = `（模拟回复）已收到：「${value}」`
  }, 3000)
}

function onCancel(): void {
  if (timer) clearTimeout(timer)
  loading.value = false
  reply.value = '（已停止生成）'
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="demo-stack">
    <PromptInput
      v-model="draft"
      placeholder="Enter 发送；生成中按钮切换为停止"
      :loading="loading"
      @submit="onSubmit"
      @cancel="onCancel"
    />
    <p class="demo-status" :class="{ 'demo-status--active': loading }">
      {{ loading ? '生成中…（可点击停止或等待完成）' : reply || '等待发送' }}
    </p>
    <PromptInput model-value="该输入框已禁用" disabled placeholder="禁用状态" />
    <p class="demo-hint">
      loading 期间 Enter 不再发送、按钮切换为停止（键盘可达）；disabled 用原生属性移出 Tab 序。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-status {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-status--active {
  color: var(--ui-accent);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
