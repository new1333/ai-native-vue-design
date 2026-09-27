<script setup lang="ts">
import { ref } from 'vue'
import { ToggleGroup } from '@ui/components'

const locked = ref('board')
const half = ref('ink')
</script>

<template>
  <div class="demo-stack">
    <ToggleGroup
      v-model="locked"
      disabled
      :items="[
        { value: 'list', label: '列表' },
        { value: 'board', label: '看板' },
      ]"
      aria-label="整组禁用的只读回显"
    />
    <ToggleGroup
      v-model="half"
      :items="[
        { value: 'ink', label: '墨色' },
        { value: 'clay', label: '陶土', disabled: true },
        { value: 'pine', label: '松绿' },
      ]"
      aria-label="含禁用项的分段"
    />
    <p class="demo-hint">
      上：整组 disabled 做只读回显（全部项移出 Tab 序）；下：陶土项禁用——不可切换且被方向键跳过，roving 落点让位于首个可用项。
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
