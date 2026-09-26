<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@ui/components'

const pickVue = ref(false)
const pickReact = ref(false)
const pickSvelte = ref(false)

const allChecked = computed(() => pickVue.value && pickReact.value && pickSvelte.value)
const partChecked = computed(
  () => !allChecked.value && (pickVue.value || pickReact.value || pickSvelte.value),
)

function toggleAll(next: boolean): void {
  pickVue.value = next
  pickReact.value = next
  pickSvelte.value = next
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-block">
      <Checkbox
        :model-value="allChecked"
        :indeterminate="partChecked"
        label="全选框架"
        @update:model-value="toggleAll"
      />
      <div class="demo-children">
        <Checkbox v-model="pickVue" label="Vue" />
        <Checkbox v-model="pickReact" label="React" />
        <Checkbox v-model="pickSvelte" label="Svelte" />
      </div>
    </div>
    <p class="demo-hint">
      「全选 + 子项」级联：父项用 indeterminate 表达部分选中（accent 实底短横线），
      子项变化由使用方汇总计算父项 modelValue 与 indeterminate；
      用户点击后浏览器自动清除 DOM 半选，父层随之复位（此处由 computed 派生）。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-block {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-children {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  padding-left: var(--ui-space-5);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
