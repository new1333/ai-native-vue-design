<script setup lang="ts">
import { ref } from 'vue'
import { Button, Popover } from '@ui/components'

const open = ref(false)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Popover v-model="open" :close-on-scrim="false">
        <template #trigger>
          <Button variant="secondary">受控气泡（已禁用 scrim 关闭）</Button>
        </template>
        <p class="demo-card-text">
          显隐由外部 open 状态决定（当前：{{ open ? '打开' : '关闭' }}）。
          closeOnScrim=false 时点击气泡之外不关闭，请用 Esc、再次点击触发元素或右侧开关。
        </p>
      </Popover>
      <Button variant="ghost" @click="open = !open">外部开关（{{ open ? '关闭' : '打开' }}）</Button>
    </div>
    <p class="demo-hint">
      绑定 v-model 即为受控：一切开合路径只发出 update:modelValue，状态收口在应用侧；
      未绑定 v-model 时组件自管开合（非受控）。
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
  align-items: flex-start;
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
