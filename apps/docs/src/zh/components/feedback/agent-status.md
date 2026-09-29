---
title: AgentStatus 运行状态
---

<script setup>
import { agentStatusMeta } from '@ui/components'
import Basic from '@docs-demos/agent-status/Basic.vue'
import basicSrc from '@docs-demos/agent-status/Basic.vue?raw'
import Lifecycle from '@docs-demos/agent-status/Lifecycle.vue'
import lifecycleSrc from '@docs-demos/agent-status/Lifecycle.vue?raw'
</script>

# AgentStatus 运行状态

<ComponentDoc :meta="agentStatusMeta" dir="agent-status">
  <Demo
    title="八档状态总览"
    anchor="states-demo"
    description="status 对齐 §14 state semantics 八档生命周期状态：排队 / 运行 / 流式输出 / 等待工具 / 工具执行 / 已完成 / 已失败 / 已取消。运行三档自带 Spinner 指示，failed 走 danger（destructive）token；detail 提供第二行补充说明，#icon 插槽可替换前置图形。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="模拟生命周期（受控 + 外部动作组合）"
    anchor="lifecycle"
    description="AgentStatus 是纯展示组件：status 由使用方受控传入，无内部状态机、无 emits。停止/重试用外部 IconButton 组合，工具批准/拒绝用外部 Button 组合；根元素 role=status + aria-live=polite，状态切换即被读屏播报。"
    :src="lifecycleSrc"
  >
    <Lifecycle />
  </Demo>
</ComponentDoc>
