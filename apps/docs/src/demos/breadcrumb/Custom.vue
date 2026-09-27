<script setup lang="ts">
import { Breadcrumb } from '@ui/components'
import type { BreadcrumbItem } from '@ui/components'

const items: BreadcrumbItem[] = [
  { key: 'home', label: '首页', href: '#/' },
  { key: 'library', label: '组件库', href: '#/library' },
  { key: 'current', label: '面包屑' },
]
</script>

<template>
  <div class="demo-stack">
    <Breadcrumb :items="items" separator="/" />

    <Breadcrumb :items="items">
      <template #separator>
        <span class="demo-sep">·</span>
      </template>
    </Breadcrumb>

    <Breadcrumb :items="items">
      <template #item="{ item, isCurrent }">
        <a
          v-if="item.href !== undefined"
          class="demo-item"
          :href="item.href"
          :aria-current="isCurrent ? 'page' : undefined"
        >
          <svg
            class="demo-item-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ item.label }}
        </a>
        <span class="demo-item demo-item--current" :aria-current="isCurrent ? 'page' : undefined">
          {{ item.label }}
        </span>
      </template>
    </Breadcrumb>

    <p class="demo-hint">
      分隔符三档：缺省 chevron 图标 → separator 文本（"/"）→ #separator 插槽；
      #item 插槽整体接管项渲染（上图第三行为图标 + 文本），此时原生 a/button
      语义与 aria-current 由使用方保证。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-sep {
  color: var(--ui-text-3);
}

.demo-item {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  font: inherit;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  text-decoration: none;
}

.demo-item:hover {
  color: var(--ui-text-1);
}

.demo-item--current {
  color: var(--ui-text-1);
  font-weight: var(--ui-font-weight-medium);
}

.demo-item-icon {
  flex: none;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
