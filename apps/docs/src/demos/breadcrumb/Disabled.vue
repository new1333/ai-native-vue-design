<script setup lang="ts">
import { ref } from 'vue'
import { Breadcrumb } from '@ui/components'
import type { BreadcrumbItemClickPayload } from '@ui/components'

const items = [
  { key: 'home', label: '首页', href: '#/' },
  { key: 'locked', label: '无权访问层（禁用）', href: '#/locked', disabled: true },
  { key: 'middle', label: '项目' },
  { key: 'current', label: '详情' },
]

const notice = ref('（点击无权访问层试试：不会发出 itemClick）')

function onItemclick(payload: BreadcrumbItemClickPayload): void {
  notice.value = `点击了：${payload.item.label}`
}
</script>

<template>
  <div class="demo-stack">
    <Breadcrumb :items="items" @item-click="onItemclick" />
    <p class="demo-hint">
      disabled 项渲染为 <code>aria-disabled="true"</code> 的 span：
      链接不做「假禁用」，不可聚焦、点击与键盘激活都不发 itemClick。
      状态：<code>{{ notice }}</code>
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

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
