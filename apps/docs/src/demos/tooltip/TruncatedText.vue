<script setup lang="ts">
import { Tooltip } from '@ui/components'

const FULL_TEXT = '纸面设计系统的组件契约元数据（ComponentDefinition）随版本演进，此处仅为节选'
</script>

<template>
  <div class="demo-stack">
    <div class="demo-line">
      <Tooltip placement="bottom">
        <button type="button" class="demo-truncated">{{ FULL_TEXT }}</button>
        <template #content>{{ FULL_TEXT }}</template>
      </Tooltip>
    </div>
    <p class="demo-hint">
      截断文本（表格单元格、面包屑）悬停查看完整内容；触发元素用原生 button
      承载以保持键盘可达，不要用 div + click 自造交互语义。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-line {
  display: flex;
}

/* 截断三件套与复位均为结构性样式（非色相/尺寸取值），颜色字号走 token */
.demo-truncated {
  max-width: calc(var(--ui-space-8) * 3);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin: 0;
  padding: 0;
  border: none;
  background-color: transparent;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-1);
  cursor: pointer;
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
