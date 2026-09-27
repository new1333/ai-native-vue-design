<script setup lang="ts">
import { ref } from 'vue'
import { Button, Suggestion } from '@ui/components'
import type { SuggestionItem } from '@ui/components'

const items: SuggestionItem[] = [
  { label: '可用建议', value: '请展开说明第一点' },
  { label: '禁用建议（单项）', value: '该建议暂不可用', disabled: true },
  { label: '另一条可用建议', value: '请对比两种方案的差异' },
]

// 受控状态在使用方：会话结束后整组禁用
const ended = ref(false)

// 生成中：loading 拦截一切选中路径（点击 / Enter / Space），chips 保持可聚焦
const generating = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function simulateGenerate(): void {
  generating.value = true
  if (timer !== undefined) clearTimeout(timer)
  timer = setTimeout(() => {
    generating.value = false
  }, 2000)
}

const selected = ref<string>('')

function onSelect(item: SuggestionItem): void {
  selected.value = item.value
}
</script>

<template>
  <div class="demo-col">
    <div class="demo-row">
      <Button size="sm" @click="simulateGenerate">模拟重新生成建议（loading 2s）</Button>
      <Button size="sm" :variant="ended ? 'secondary' : 'ghost'" @click="ended = !ended">
        {{ ended ? '恢复会话' : '模拟会话结束（整组禁用）' }}
      </Button>
    </div>

    <Suggestion
      :items="items"
      :loading="generating"
      :disabled="ended"
      aria-label="推荐追问"
      @select="onSelect"
    >
      <template #default>
        {{ generating ? '建议生成中，选择已被暂时拦截…' : ended ? '会话已结束，建议不可选。' : '推荐追问' }}
      </template>
    </Suggestion>

    <p class="demo-result">
      <template v-if="selected">已回填：{{ selected }}</template>
      <template v-else>loading / disabled / 单项禁用期间点击或按 Enter/Space 均不触发 select。</template>
    </p>
  </div>
</template>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}

.demo-result {
  margin: 0;
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}
</style>
