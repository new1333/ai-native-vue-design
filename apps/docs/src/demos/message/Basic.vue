<script setup lang="ts">
import { Message } from '@ui/components'
</script>

<template>
  <div class="demo-stack">
    <div class="conversation">
      <Message role="user" name="我" timestamp="14:30">
        帮我把这周的构建日志汇总成三条要点。
      </Message>
      <Message role="assistant" name="纸面助手" timestamp="14:31">
        好的，本周共 12 次构建：10 次通过、2 次因类型检查失败回滚，主要集中在 input-number 目录。
      </Message>
      <Message role="system" timestamp="14:32">
        会话上下文已达上限，较早的消息已被折叠。
      </Message>
    </div>
    <p class="demo-hint">
      role 决定布局与配皮：user 右对齐（accent-soft 气泡）、assistant 左对齐（surface 底 + 描边）、
      system 居中弱化（无气泡）；头像未传 src 时按 name 回退首字母（助手）。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.conversation {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
