<script setup lang="ts">
import { ref } from 'vue'
import { Artifact, Button, IconButton } from '@ui/components'

const open = ref(false)
const regenerated = ref(0)

function onRegenerate(): void {
  regenerated.value += 1
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="open = true">打开自定义头部产物</Button>
    </div>
    <p class="demo-hint">
      #header 插槽整体替换默认头部（标题、徽标与操作栏）：用 IconButton 自由组合「重新生成」等动作。
      使用后内置复制/关闭与 aria-labelledby 不再出具——示例经
      <code>aria-label</code> attrs 命名面板，并置
      <code>:close-on-scrim="false"</code> 拦截遮罩误触（关闭走自定义按钮或 Esc）。
      重新生成次数：<code>{{ regenerated }}</code>
    </p>
    <Artifact v-model="open" aria-label="重构建议" :close-on-scrim="false">
      <template #header>
        <div class="demo-header">
          <span class="demo-header__title">重构建议（自定义操作栏）</span>
          <span class="demo-header__badge">v{{ regenerated + 1 }}</span>
          <span class="demo-header__spacer" aria-hidden="true"></span>
          <IconButton size="sm" aria-label="重新生成" @click="onRegenerate">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M21 3v5h-5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8 16H3v5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </IconButton>
          <IconButton size="sm" aria-label="关闭" @click="open = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </IconButton>
        </div>
      </template>
      <p class="demo-body-text">
        建议把数据获取从组件内提升到组合式函数，统一错误边界与加载态；
        表格列定义改为配置驱动，减少模板分支。
      </p>
    </Artifact>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
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

.demo-header {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--ui-space-2);
  min-width: 0;
}

.demo-header__title {
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.demo-header__badge {
  flex: none;
  padding: var(--ui-space-1) var(--ui-space-2);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
  background-color: var(--ui-surface-muted);
  border-radius: var(--ui-radius-xs);
}

.demo-header__spacer {
  flex: 1;
}

.demo-body-text {
  margin: 0;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}
</style>
