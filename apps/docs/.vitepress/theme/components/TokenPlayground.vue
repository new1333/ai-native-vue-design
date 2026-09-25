<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Button, Input, Progress, Switch } from '@ui/components'

/**
 * Token 实验器：在预览容器上以 inline style 覆盖少量 --ui-* 变量，
 * 用真实组件即时呈现效果。仅作用于预览区（CSS 自定义属性继承作用域），
 * 页面其余部分不受影响；初始值在 onMounted 读取，重置即恢复。
 */
interface TokenState {
  accent: string
  accentSoft: string
  radius: string
}

const initial = reactive<TokenState>({ accent: '', accentSoft: '', radius: '' })
const current = reactive<TokenState>({ accent: '', accentSoft: '', radius: '' })

const ready = computed(() => initial.accent !== '')

onMounted(() => {
  const styles = getComputedStyle(document.documentElement)
  initial.accent = styles.getPropertyValue('--ui-accent').trim()
  initial.accentSoft = styles.getPropertyValue('--ui-accent-soft').trim()
  initial.radius = styles.getPropertyValue('--ui-radius-md').trim()
  reset()
})

function reset(): void {
  current.accent = initial.accent
  current.accentSoft = initial.accentSoft
  current.radius = initial.radius
}

const previewStyle = computed<Record<string, string>>(() => ({
  '--ui-accent': current.accent,
  '--ui-accent-soft': current.accentSoft,
  '--ui-radius-md': current.radius,
}))

const keyword = ref('token 预览')
const autoSync = ref(true)
</script>

<template>
  <section class="ui-docs-playground">
    <div class="ui-docs-playground__controls">
      <label class="ui-docs-play__field">
        <span>--ui-accent</span>
        <input v-model="current.accent" type="color" :disabled="!ready" />
      </label>
      <label class="ui-docs-play__field">
        <span>--ui-accent-soft</span>
        <input v-model="current.accentSoft" type="color" :disabled="!ready" />
      </label>
      <label class="ui-docs-play__field">
        <span>--ui-radius-md</span>
        <input v-model="current.radius" type="range" min="0" max="16" step="1" :disabled="!ready" />
        <code>{{ current.radius }}</code>
      </label>
      <Button size="sm" :disabled="!ready" @click="reset">重置</Button>
    </div>

    <div :style="previewStyle" class="ui-docs-playground__preview">
      <Button variant="primary">主要动作</Button>
      <Button>常规动作</Button>
      <Input v-model="keyword" placeholder="输入点东西" />
      <label class="ui-docs-play__switch">
        <Switch v-model="autoSync" />
        <span>自动同步</span>
      </label>
      <Progress :value="72" />
    </div>
  </section>
</template>

<style scoped>
.ui-docs-playground {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  padding: var(--ui-space-4);
}

.ui-docs-playground__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--ui-space-4);
  margin-bottom: var(--ui-space-5);
}

.ui-docs-play__field {
  display: grid;
  gap: var(--ui-space-1);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  font-family: var(--vp-font-family-mono);
}

.ui-docs-play__field input[type='color'] {
  width: var(--ui-space-8);
  height: var(--ui-space-6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xs);
  background: var(--ui-surface);
  padding: 0;
}

.ui-docs-play__field input[type='range'] {
  accent-color: var(--ui-accent);
}

.ui-docs-playground__preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
  border: 1px dashed var(--ui-border-strong);
  border-radius: var(--ui-radius-md);
  padding: var(--ui-space-5);
}

.ui-docs-play__switch {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}
</style>
