<script setup lang="ts">
import { ref } from 'vue'
import { Button, Radio, RadioGroup } from '@ui/components'
import type { RadioValue } from '@ui/components'

const sort = ref<RadioValue>('recent')

function applyPreset(value: RadioValue): void {
  sort.value = value
}
</script>

<template>
  <div class="demo-stack">
    <RadioGroup v-model="sort" name="sort" aria-label="列表排序">
      <Radio value="recent" label="最近更新" />
      <Radio value="stars" label="最多收藏" />
      <Radio value="name" label="名称排序" />
    </RadioGroup>
    <div class="demo-actions">
      <Button
        size="sm"
        :variant="sort === 'recent' ? 'primary' : 'secondary'"
        @click="applyPreset('recent')"
      >
        编程式选中「最近更新」
      </Button>
      <Button
        size="sm"
        :variant="sort === 'name' ? 'primary' : 'secondary'"
        @click="applyPreset('name')"
      >
        编程式选中「名称排序」
      </Button>
    </div>
    <p class="demo-hint">
      选中态只由组受控值派生：改 v-model 即可编程式选中，无需触碰 Radio 实例；
      Radio 选中后不可取消（只能换选），互斥语义由原生 name 兜底。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
