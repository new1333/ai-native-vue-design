<script setup lang="ts">
import { Image } from '@ui/components'

/**
 * 内置 SVG 图片（data URL）：demo 自包含、无网络依赖。
 * SVG 是图片资源本身（内容资产），其中的色值为图片内容而非页面样式；页面样式只走 --ui-* token。
 */
const svgSrc = (label: string, background: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="${background}"/><text x="120" y="88" font-family="sans-serif" font-size="22" fill="#FCFBF8" text-anchor="middle">${label}</text></svg>`,
  )}`

const photos = [
  { fit: 'contain', label: 'contain 完整收纳', background: '#33594A' },
  { fit: 'cover', label: 'cover 裁剪铺满', background: '#B8863B' },
  { fit: 'fill', label: 'fill 拉伸铺满', background: '#A9503C' },
] as const
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <figure v-for="photo in photos" :key="photo.fit" class="demo-figure">
        <Image
          :src="svgSrc(photo.label, photo.background)"
          :alt="photo.label"
          :fit="photo.fit"
          class="demo-frame"
        />
        <figcaption class="demo-caption">{{ photo.label }}</figcaption>
      </figure>
    </div>
    <p class="demo-hint">
      fit 控制成框（约束宽高）后的填充方式；未约束宽高时与原生 img 行为一致。alt 缺省为空字符串（装饰图），内容图必须显式传入。
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

.demo-figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

/* 框尺寸由 token 推导：192 × 128 */
.demo-frame {
  width: calc(var(--ui-space-8) * 3);
  height: calc(var(--ui-space-8) * 2);
}

.demo-caption {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  line-height: var(--ui-leading-small);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
