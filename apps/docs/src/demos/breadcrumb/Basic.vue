<script setup lang="ts">
import { ref } from 'vue'
import { Breadcrumb } from '@ui/components'
import type { BreadcrumbItemClickPayload } from '@ui/components'

const items = [
  { key: 'home', label: '首页', href: '#/' },
  { key: 'library', label: '组件库', href: '#/library' },
  { key: 'navigation', label: '导航', href: '#/library/navigation' },
  { key: 'current', label: '面包屑' },
]

const lastClicked = ref('（尚未点击）')

function onItemclick(payload: BreadcrumbItemClickPayload): void {
  lastClicked.value = `${payload.item.label}（第 ${payload.index} 项）`
  // 有 href 的项：itemClick 在原生 click 阶段先于导航发出，
  // 此处不调用 payload.event.preventDefault()，链接正常跳转。
}
</script>

<template>
  <div class="demo-stack">
    <Breadcrumb :items="items" @item-click="onItemclick" />
    <p class="demo-hint">
      有 href 的项渲染为原生 <code>&lt;a&gt;</code>（链接语义优先，Enter 可激活导航）；
      无 href 的末项渲染为 <code>&lt;button&gt;</code>，点击或键盘 Enter / Space 都发出 itemClick。
      最近点击：<code>{{ lastClicked }}</code>
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
