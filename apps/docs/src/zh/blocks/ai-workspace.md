---
title: AI 工作台 AiWorkspace
description: 对话式 AI 页面：会话列表、模型选择、推理与工具卡审批、流式回复与建议词输入
---

<script setup>
import AiWorkspaceBlock from '@docs-blocks/AiWorkspaceBlock.vue'
import aiWorkspaceSrc from '@docs-blocks/AiWorkspaceBlock.vue?raw'
</script>

# AI 工作台 AiWorkspace

纸面的旗舰构建块：一个完整的对话式 AI 工作台页面。[Layout](/components/general/layout) 提供侧栏 + 主区壳，消息流覆盖 AI 交互的完整生命周期——思考（Reasoning）、工具调用与审批（ToolCallCard）、流式回复（StreamingText）。

<p class="block-try"><span class="block-try__label">试试</span>发送一条消息看「思考 → 工具 → 流式回答」全链路；在预置对话里审批/驳回 <code>rollback_deploy</code>；点建议词回填输入框；生成中点停止；左栏切换会话与新建对话；侧栏底部折叠侧栏。</p>

<BlockPreview :src="aiWorkspaceSrc">
  <AiWorkspaceBlock />
</BlockPreview>

## 组成

| 区域 | 组件 |
| --- | --- |
| 页面壳 | [Layout](/components/general/layout) 家族（`LayoutSider` 可折叠 + 嵌套 `LayoutHeader` / `LayoutContent`） |
| 会话列表 | 自定义列表（`Button` 新建 + [Avatar](/components/general/avatar) 账号区） |
| 顶栏 | [ModelSelector](/components/inputs/model-selector)（模型切换）+ [AgentStatus](/components/feedback/agent-status)（运行状态 live region） |
| 消息流 | [MessageList](/components/data/message-list) + [Message](/components/data/message)（分发模式） |
| AI 过程 | [Reasoning](/components/feedback/reasoning)、[ToolCallCard](/components/data/tool-call-card)（`waitingApproval` 审批）、[StreamingText](/components/data/streaming-text)（`markdown` 段落） |
| 输入区 | [Suggestion](/components/inputs/suggestion) + [PromptInput](/components/inputs/prompt-input)（Enter 发送 / loading 变停止按钮） |
| 反馈 | [Toast](/components/feedback/toast) |

## 复制使用

- 依赖：`@ui/tokens/paper.css` + `@ui/components`；
- 「复制源码」保存为 `src/blocks/AiWorkspaceBlock.vue`；
- `send()` 里的演示生成链（setTimeout 驱动）替换为真实流式接口：`StreamingText` 接收**累计全文**，服务端每推一个 token 整体更新即可；
- 工具审批流：`ToolCallCard` 的 `status` 是受控 prop，由你的业务驱动 `waitingApproval → running → completed/failed`；
- 会话数据在 `conversations` 中集中维护，对接你的持久化层。
