<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Switch } from '@ui/components'

const syncEnabled = ref(false)
const saving = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined

function toggleSync(next: boolean): void {
  // 纯受控：先展示 loading（aria-busy，拦截再次切换），异步完成后才回写状态
  saving.value = true
  timer = setTimeout(() => {
    saving.value = false
    syncEnabled.value = next
  }, 1500)
}

onBeforeUnmount(() => {
  if (timer !== undefined) clearTimeout(timer)
})
</script>

<template>
  <div class="demo-stack">
    <Switch
      :model-value="syncEnabled"
      :loading="saving"
      label="自动同步"
      @update:model-value="toggleSync"
    />
    <p class="demo-hint">
      异步切换推荐路径：点击 → 置 loading → 完成后回写 modelValue。
      loading 置 aria-busy="true" 且不落 disabled（保持可聚焦），期间点击/键盘激活一律不切换；
      圆点让位旋转指示，label 提示进行中。
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
