<script setup lang="ts">
import { HoverCard } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <HoverCard>
        <template #trigger>
          <button type="button" class="demo-native-trigger">默认节奏（150ms / 150ms）</button>
        </template>
        <p class="demo-card-text">进入 150ms 后开启，移出 150ms 内可移入卡片停留。</p>
      </HoverCard>
      <HoverCard :open-delay="600" :close-delay="400">
        <template #trigger>
          <button type="button" class="demo-native-trigger">迟缓节奏（600ms / 400ms）</button>
        </template>
        <p class="demo-card-text">掠过不易误弹；移出后有 400ms 宽限把指针挪进卡片。</p>
      </HoverCard>
      <HoverCard :open-delay="0" :close-delay="0">
        <template #trigger>
          <button type="button" class="demo-native-trigger">即时节奏（0ms / 0ms）</button>
        </template>
        <p class="demo-card-text">进出即时开合，接近 Tooltip 的节奏（但卡片可停留）。</p>
      </HoverCard>
    </div>
    <p class="demo-hint">
      openDelay 控制进入后多久开启（防掠过即弹）；closeDelay 是移出后的收起宽限，
      期间移回触发元素或移入卡片即取消关闭。
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
  gap: var(--ui-space-2);
  align-items: center;
}

.demo-native-trigger {
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  cursor: pointer;
}

.demo-card-text {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
