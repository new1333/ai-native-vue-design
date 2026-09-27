<script setup lang="ts">
import { ToolCallCard } from '@ui/components'
</script>

<template>
  <ToolCallCard
    name="web_search"
    :args="{ query: '纸面 设计系统', limit: 5 }"
    result="命中 5 条结果：设计 token 规范、组件契约元数据、文档站规约、状态语义、动效白名单。"
    status="completed"
    :duration="850"
  />
</template>
