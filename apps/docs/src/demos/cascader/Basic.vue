<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@ui/components'
import type { CascaderOption, CascaderPath } from '@ui/components'

const regionOptions: CascaderOption[] = [
  {
    label: '浙江省',
    value: 'cn-zj',
    children: [
      { label: '杭州市', value: 'cn-zj-hz', children: [{ label: '西湖区', value: 'cn-zj-hz-xh' }, { label: '余杭区', value: 'cn-zj-hz-yh' }] },
      { label: '宁波市', value: 'cn-zj-nb' },
    ],
  },
  {
    label: '江苏省',
    value: 'cn-js',
    children: [
      { label: '南京市', value: 'cn-js-nj', children: [{ label: '鼓楼区', value: 'cn-js-nj-gl' }] },
      { label: '苏州市', value: 'cn-js-sz' },
    ],
  },
  { label: '北京市', value: 'cn-bj' },
]

const region = ref<CascaderPath | null>(['cn-zj', 'cn-zj-hz'])
const category = ref<CascaderPath | null>(null)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <label class="demo-field-label" for="cascader-basic-region">所在地区（受控 v-model，初始已选）</label>
      <Cascader id="cascader-basic-region" v-model="region" :options="regionOptions" placeholder="选择省 / 市 / 区" />
    </div>
    <div class="demo-row">
      <label class="demo-field-label" for="cascader-basic-category">未选态（显示 placeholder）</label>
      <Cascader id="cascader-basic-category" v-model="category" :options="regionOptions" />
    </div>
    <p class="demo-hint">
      当前值：region=<code>{{ region ? JSON.stringify(region) : 'null（未选）' }}</code>，
      category=<code>{{ category ? JSON.stringify(category) : 'null（未选）' }}</code>
      （modelValue 为「从根到目标」的值路径数组；不可解析的路径回落占位态）
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

.demo-row :deep(.ui-cascader) {
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
