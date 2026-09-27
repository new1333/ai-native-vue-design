<script setup lang="ts">
import { Image } from '@ui/components'

/** 内置 SVG 图片（data URL）：demo 自包含；SVG 为图片内容资产，页面样式只走 --ui-* token。 */
const svgSrc = (label: string, background: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="${background}"/><text x="120" y="88" font-family="sans-serif" font-size="22" fill="#FCFBF8" text-anchor="middle">${label}</text></svg>`,
  )}`

const photos = [
  { alt: '松林雪径', background: '#33594A' },
  { alt: '梯田清晨', background: '#3E7C57' },
  { alt: '崖边栈道', background: '#B8863B' },
  { alt: '湖面孤舟', background: '#2A4A3D' },
  { alt: '石桥落雨', background: '#A9503C' },
  { alt: '山间晨雾', background: '#8A9BA8' },
] as const
</script>

<template>
  <div class="demo-stack">
    <div class="demo-scroll">
      <Image
        v-for="(photo, index) in photos"
        :key="photo.alt"
        :src="svgSrc(photo.alt, photo.background)"
        :alt="photo.alt"
        fit="cover"
        lazy
        class="demo-frame"
      >
        <template v-if="index === 0" #placeholder>
          <span class="demo-ph-text">下滑进入视口后加载…</span>
        </template>
      </Image>
    </div>
    <p class="demo-hint">
      lazy：进入视口（IntersectionObserver，仅 mounted 创建）前不渲染 img、不发请求；第一张的占位文案用
      placeholder 插槽自定义，其余用默认占位。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

/* 固定高滚动容器：图片多过视口，滚动时才逐张进入视口并加载 */
.demo-scroll {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  height: calc(var(--ui-space-8) * 3);
  padding: var(--ui-space-3);
  overflow-y: auto;
  background-color: var(--ui-surface-muted);
  border-radius: var(--ui-radius-md);
}

/* 框尺寸由 token 推导：192 × 64 */
.demo-frame {
  width: calc(var(--ui-space-8) * 3);
  height: calc(var(--ui-space-8));
  flex: none;
}

.demo-ph-text {
  padding: 0 var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
  text-align: center;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
