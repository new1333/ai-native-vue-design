<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@ui/components'
import type { AutoCompleteOption } from '@ui/components'

const cities: AutoCompleteOption[] = [
  { label: '北京', value: 'beijing' },
  { label: '南京', value: 'nanjing' },
  { label: '北海', value: 'beihai' },
  { label: '上海', value: 'shanghai' },
  { label: '杭州（暂不可选）', value: 'hangzhou', disabled: true },
]

const text = ref('')
const picked = ref('（尚未选择）')

function onSelect(value: { label: string; value: string | number }) {
  picked.value = `${value.label}（${value.value}）`
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="autocomplete-basic-city">城市（本地过滤）</label>
      <AutoComplete
        id="autocomplete-basic-city"
        v-model="text"
        :options="cities"
        placeholder="输入城市名"
        @select="onSelect"
      />
    </div>
    <p class="demo-hint">
      当前文本：<code>{{ text || '空' }}</code>，最近选中：<code>{{ picked }}</code>
      （v-model 即输入框文本；选中后文本同步为建议 label，机器值取 select 负载的 option.value；
      默认 filter 按 label 包含匹配、不区分大小写）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-field-label {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-row :deep(.ui-autocomplete) {
  width: calc(var(--ui-space-8) * 3);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
