<script setup lang="ts">
import { ref } from 'vue'
import { Image, Skeleton } from '@ui/components'

/** 内置 SVG 图片（data URL）：demo 自包含；SVG 为图片内容资产，页面样式只走 --ui-* token。 */
const svgSrc = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#33594A"/><text x="120" y="88" font-family="sans-serif" font-size="22" fill="#FCFBF8" text-anchor="middle">${label}</text></svg>`,
  )}`

const src = svgSrc('湖面晨雾')

/** 每次重载递增 key 重建组件，重放 loading → loaded 状态机。 */
const reloadKey = ref(0)
const lastEvent = ref('—')
function reload(): void {
  reloadKey.value += 1
  lastEvent.value = '—'
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-toolbar">
      <button type="button" class="demo-button" @click="reload">重新加载</button>
      <span class="demo-event">最近事件：{{ lastEvent }}</span>
    </div>
    <Image
      :key="reloadKey"
      :src="src"
      alt="湖面晨雾"
      fit="cover"
      class="demo-frame"
      @load="lastEvent = 'load'"
      @error="lastEvent = 'error'"
    >
      <template #placeholder>
        <Skeleton variant="rect" width="100%" height="100%" />
      </template>
    </Image>
    <p class="demo-hint">
      点击「重新加载」重放 loading → loaded 状态机；加载期占位用 placeholder 插槽自定义（此处放
      Skeleton），load / error 事件实时回显。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-toolbar {
  display: flex;
  align-items: center;
  gap: var(--ui-space-4);
}

.demo-button {
  padding: var(--ui-space-1) var(--ui-space-3);
  border: none;
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-accent);
  color: var(--ui-on-accent);
  font-size: var(--ui-text-sm);
  cursor: pointer;
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.demo-button:hover {
  background-color: var(--ui-accent-hover);
}

.demo-event {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  font-variant-numeric: var(--ui-numeric);
}

/* 框尺寸由 token 推导：256 × 128 */
.demo-frame {
  width: calc(var(--ui-space-8) * 4);
  height: calc(var(--ui-space-8) * 2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
