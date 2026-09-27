<script setup lang="ts">
import { ToolCallCard } from '@ui/components'
</script>

<template>
  <div class="demo-grid">
    <div class="demo-cell">
      <p class="demo-label">queued · 排队中（仅入参，尚无结果与耗时）</p>
      <ToolCallCard name="run_sql" :args="{ sql: 'SELECT count(*) FROM orders' }" />
    </div>

    <div class="demo-cell">
      <p class="demo-label">running · 运行中（加载态：结果未产出）</p>
      <ToolCallCard name="run_sql" :args="{ sql: 'SELECT count(*) FROM orders' }" status="running" />
    </div>

    <div class="demo-cell">
      <p class="demo-label">completed · 已完成（入参 + 结果 + 耗时）</p>
      <ToolCallCard
        name="run_sql"
        :args="{ sql: 'SELECT count(*) FROM orders' }"
        result="count(*) = 1024"
        status="completed"
        :duration="1240"
      />
    </div>

    <div class="demo-cell">
      <p class="demo-label">failed · 失败（结果区以 danger 语义色表达错误输出）</p>
      <ToolCallCard
        name="run_sql"
        :args="{ sql: 'DROP TABLE orders' }"
        result="Error: permission denied for table 'orders'"
        status="failed"
        :duration="96"
      />
    </div>

    <div class="demo-cell">
      <p class="demo-label">waitingApproval · 待审批</p>
      <ToolCallCard
        name="send_email"
        :args="{ to: 'ops@example.com', subject: '部署通知' }"
        status="waitingApproval"
      />
    </div>

    <div class="demo-cell">
      <p class="demo-label">waitingApproval + disabled · 审批操作禁用（原生 disabled 置灰）</p>
      <ToolCallCard
        name="send_email"
        :args="{ to: 'ops@example.com', subject: '部署通知' }"
        status="waitingApproval"
        disabled
      />
    </div>
  </div>
</template>

<style scoped>
.demo-grid {
  display: grid;
  gap: var(--ui-space-5);
}

.demo-label {
  margin: 0 0 var(--ui-space-2);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}
</style>
