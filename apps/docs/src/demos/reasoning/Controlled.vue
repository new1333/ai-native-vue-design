<script setup lang="ts">
import { ref } from 'vue'
import { Button, Reasoning } from '@ui/components'

/** 受控展开态：组件的展开意向经 @toggle 上报到这里回写。 */
const expanded = ref(false)
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button size="sm" @click="expanded = !expanded">
        外部切换（{{ expanded ? '展开' : '收起' }}）
      </Button>
      <span class="demo-state">expanded = {{ expanded }}</span>
    </div>

    <Reasoning
      :expanded="expanded"
      :duration="12.6"
      content="先把需求拆成三个子任务：数据接入、口径对齐、报表渲染……逐个评估工作量：接入 1 天、口径 0.5 天、渲染 2 天；关键风险在口径对齐——历史数据里有两个字段语义变更过，需要与数据组确认快照版本……"
      @toggle="expanded = $event"
    />
  </div>
</template>

<style scoped>
.demo-stack {
  display: grid;
  gap: var(--ui-space-4);
}

.demo-actions {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
}

.demo-state {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  font-variant-numeric: var(--ui-numeric);
}
</style>
