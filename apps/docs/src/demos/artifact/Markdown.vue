<script setup lang="ts">
import { ref } from 'vue'
import { Artifact, Button } from '@ui/components'

const open = ref(false)
const inserted = ref(false)

function onInsert(): void {
  inserted.value = true
  open.value = false
}
</script>

<template>
  <div class="demo-stack">
    <div class="demo-actions">
      <Button variant="primary" @click="open = true">打开文档产物</Button>
      <span v-if="inserted" class="demo-done">已把内容插入到文档（示例动作）</span>
    </div>
    <p class="demo-hint">
      <code>type="markdown"</code>：内容由使用方渲染后放入 default 插槽（本组件不做 Markdown 解析与高亮）；
      footer 插槽只在提供时渲染，常放「取消 + 主动作」对，且一个 footer 只放一个 primary。
    </p>
    <Artifact v-model="open" title="Q4 发布方案（节选）" type="markdown">
      <article class="demo-article">
        <h3>发布节奏</h3>
        <p>按周滚动发布：周三灰度、周五全量；出现 P1 及以上缺陷时立即冻结本周发布窗口。</p>
        <h3>回滚策略</h3>
        <p>保留最近 5 个版本的一键回滚；回滚操作记录到变更审计。</p>
      </article>
      <template #footer>
        <Button @click="open = false">取消</Button>
        <Button variant="primary" @click="onInsert">插入到文档</Button>
      </template>
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
  align-items: center;
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

.demo-done {
  font-size: var(--ui-text-sm);
  color: var(--ui-success);
}

.demo-article h3 {
  margin: var(--ui-space-4) 0 var(--ui-space-2);
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.demo-article p {
  margin: 0;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}
</style>
