<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { AutoComplete } from '@ui/components'
import type { AutoCompleteOption, AutoCompleteSelectedOption } from '@ui/components'

const CITY_REPOSITORY: AutoCompleteOption[] = [
  { label: '北京', value: 'beijing' },
  { label: '北海', value: 'beihai' },
  { label: '南京', value: 'nanjing' },
  { label: '上海', value: 'shanghai' },
  { label: '杭州', value: 'hangzhou' },
  { label: '苏州', value: 'suzhou' },
]

const keyword = ref('')
const options = ref<AutoCompleteOption[]>([])
const loading = ref(false)
const events = ref<string[]>([])
let requestTimer: ReturnType<typeof setTimeout> | undefined

function log(message: string) {
  events.value = [message, ...events.value].slice(0, 4)
}

function handleSearch(keyword: string) {
  log(`search("${keyword}") —— 模拟请求中`)
  loading.value = true
  if (requestTimer !== undefined) clearTimeout(requestTimer)
  requestTimer = setTimeout(() => {
    options.value = keyword
      ? CITY_REPOSITORY.filter((city) => city.label.includes(keyword))
      : CITY_REPOSITORY
    loading.value = false
    log(`结果到达：${options.value.length} 条`)
  }, 600)
}

function handleSelect(option: AutoCompleteSelectedOption) {
  log(`select("${option.label}", value="${option.value}")`)
}

onBeforeUnmount(() => {
  if (requestTimer !== undefined) clearTimeout(requestTimer)
})
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="autocomplete-remote-city">远程城市搜索</label>
      <AutoComplete
        id="autocomplete-remote-city"
        v-model="keyword"
        :options="options"
        :filter="false"
        :debounce="200"
        :loading="loading"
        placeholder="输入城市名（远程）"
        clearable
        @search="handleSearch"
        @select="handleSelect"
      />
    </div>
    <p class="demo-hint">
      filter=<code>false</code>（远程结果即最终建议，不再本地过滤）；search 经
      <code>debounce=200</code> 防抖；<code>loading</code> 时面板显示「加载中…」（role=status）、
      listbox aria-busy="true"。事件流：{{ events.join(' ｜ ') || '（尚无）' }}
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
