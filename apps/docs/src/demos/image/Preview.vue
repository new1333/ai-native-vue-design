<script setup lang="ts">
import { Image } from '@ui/components'

/** 内置 SVG 图片（data URL）：demo 自包含；SVG 为图片内容资产，页面样式只走 --ui-* token。 */
const svgSrc = (label: string, background: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="${background}"/><text x="120" y="88" font-family="sans-serif" font-size="22" fill="#FCFBF8" text-anchor="middle">${label}</text></svg>`,
  )}`

const photos = [
  { alt: '山间晨雾', background: '#33594A' },
  { alt: '湖面孤舟', background: '#B8863B' },
] as const
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <Image
        v-for="photo in photos"
        :key="photo.alt"
        :src="svgSrc(photo.alt, photo.background)"
        :alt="photo.alt"
        fit="cover"
        preview
        class="demo-frame"
      />
    </div>
    <p class="demo-hint">
      点击图片放大预览（鼠标悬停光标为放大镜）：Esc / 点击遮罩 / 右上角关闭按钮关闭，Tab
      焦点圈定在浮层内，关闭后焦点回归触发器；键盘用户 Tab 到图片后按 Enter 打开。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-4);
}

/* 框尺寸由 token 推导：192 × 128 */
.demo-frame {
  width: calc(var(--ui-space-8) * 3);
  height: calc(var(--ui-space-8) * 2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
