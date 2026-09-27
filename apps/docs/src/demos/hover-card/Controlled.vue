<script setup lang="ts">
import { ref } from 'vue'
import { HoverCard } from '@ui/components'

const open = ref(false)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <HoverCard v-model="open" :close-delay="400" placement="bottom">
        <template #trigger>
          <button type="button" class="demo-native-trigger">受控预览卡（悬停或聚焦我）</button>
        </template>
        <p class="demo-card-text">显隐由外部 open 状态决定（当前：{{ open ? '打开' : '关闭' }}）。</p>
      </HoverCard>
      <button type="button" class="demo-native-trigger" @click="open = !open">
        外部开关（{{ open ? '关闭' : '打开' }}）
      </button>
    </div>
    <p class="demo-hint">
      绑定 v-model 即为受控：hover / focus / Esc 等一切开合路径只发出 update:modelValue，
      状态收口在应用侧；未绑定 v-model 时组件自管开合（非受控）。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
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

.demo-native-trigger {
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  cursor: pointer;
}

.demo-card-text {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
