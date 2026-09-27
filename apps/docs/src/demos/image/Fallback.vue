<script setup lang="ts">
import { ref } from 'vue'
import { Image } from '@ui/components'

/** 内置 SVG 图片（data URL）：demo 自包含；SVG 为图片内容资产，页面样式只走 --ui-* token。 */
const svgSrc = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#3E7C57"/><text x="120" y="88" font-family="sans-serif" font-size="22" fill="#FCFBF8" text-anchor="middle">${label}</text></svg>`,
  )}`

/** 演示用失效地址：真实站点返回 404，触发原生 error。 */
const BAD_SRC = './__demo_broken__.png'
const FALLBACK_SRC = svgSrc('已回落到备用图')

/** error 插槽内「重新加载」：递增 key 重建组件重试。 */
const retryKey = ref(0)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <figure class="demo-figure">
        <Image
          :src="BAD_SRC"
          :fallback="FALLBACK_SRC"
          alt="带兜底的图片"
          fit="cover"
          class="demo-frame"
        />
        <figcaption class="demo-caption">fallback：主源失败自动回落备用图</figcaption>
      </figure>
      <figure class="demo-figure">
        <Image :src="BAD_SRC" alt="默认失败视图" fit="cover" class="demo-frame" />
        <figcaption class="demo-caption">无 fallback：默认失败视图（danger 软面）</figcaption>
      </figure>
      <figure class="demo-figure">
        <Image :key="retryKey" :src="BAD_SRC" alt="自定义失败引导" fit="cover" class="demo-frame">
          <template #error>
            <button type="button" class="demo-button" @click="retryKey++">重新加载</button>
          </template>
        </Image>
        <figcaption class="demo-caption">error 插槽：自定义失败引导</figcaption>
      </figure>
    </div>
    <p class="demo-hint">
      fallback 自身失败才落入 error 终态；每次失败尝试都会触发一次 error 事件（主源与 fallback 各一次）。
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

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
