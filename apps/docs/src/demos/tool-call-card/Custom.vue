<script setup lang="ts">
import { Button, ToolCallCard } from '@ui/components'
</script>

<template>
  <ToolCallCard
    name="search_components"
    :args="{ keyword: 'form', family: 'inputs' }"
    :result="[
      'Form 表单布局与校验上下文',
      'Input / Textarea 文本录入',
      'Select 下拉选择',
    ]"
    status="completed"
    :duration="340"
  >
    <!-- #header 整体接管头部：接管后内置状态 live region 移除，播报由接管方自行承担 -->
    <template #header="{ name, status, duration }">
      <div class="custom-header">
        <code class="custom-header__name">{{ name }}</code>
        <span class="custom-header__meta">{{ status }} · {{ duration }}ms</span>
      </div>
    </template>

    <!-- #args 覆盖入参渲染：区块标签「入参」仍由组件渲染 -->
    <template #args="{ formatted }">
      <div class="custom-block">
        <p class="custom-block__caption">由使用方渲染的入参（styled pre）</p>
        <pre class="custom-block__code">{{ formatted }}</pre>
      </div>
    </template>

    <!-- #result 覆盖结果渲染：scope 提供 result / formatted / status -->
    <template #result="{ formatted }">
      <div class="custom-block">
        <p class="custom-block__caption">命中 3 个组件（自定义富渲染位）</p>
        <pre class="custom-block__code">{{ formatted }}</pre>
      </div>
    </template>

    <!-- #footer 附加操作：失败重试、查看原始输出等由使用方承载 -->
    <template #footer>
      <Button size="sm" variant="primary">查看原始输出</Button>
      <Button size="sm">复制 JSON</Button>
    </template>
  </ToolCallCard>
</template>

<style scoped>
.custom-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.custom-header__name {
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.custom-header__meta {
  font-size: var(--ui-text-xs);
  font-variant-numeric: var(--ui-numeric);
  color: var(--ui-text-3);
}

.custom-block {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}

.custom-block__caption {
  margin: 0;
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}

.custom-block__code {
  margin: 0;
  padding: var(--ui-space-2) var(--ui-space-3);
  background-color: var(--ui-surface-muted);
  border-radius: var(--ui-radius-sm);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-2);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
