<script setup lang="ts">
/**
 * AI 对话工作台构建块（旗舰）：Layout 壳 + 会话列表 + ModelSelector +
 * AgentStatus + MessageList（推理 / 工具卡 / 流式回复）+ Suggestion + PromptInput。
 * 仅依赖 @ui/components 与 --ui-* token；演示态生成链全部为确定性假数据。
 */
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import {
  AgentStatus,
  Avatar,
  Button,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Message,
  MessageList,
  ModelSelector,
  PromptInput,
  Reasoning,
  StreamingText,
  Suggestion,
  ToolCallCard,
  toast,
  ToastHost,
} from '@ui/components'
import type { ModelSelectorModel, SuggestionItem, ToolCallStatus } from '@ui/components'

interface AssistantTool {
  name: string
  args: unknown
  result?: unknown
  status: ToolCallStatus
  duration?: number | null
}

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
  streaming?: boolean
  reasoning?: { content: string; duration: number }
  reasoningLive?: boolean
  tool?: AssistantTool
}

interface Conversation {
  id: string
  title: string
  updatedAt: string
  messages: ChatMessage[]
}

let uid = 100
const nextId = (): number => ++uid

const conversations = reactive<Conversation[]>([
  {
    id: 'c1',
    title: '预发环境排障',
    updatedAt: '今天 14:32',
    messages: [
      {
        id: 1,
        role: 'user',
        text: '预发环境 14:30 之后错误率抬升，帮我看看根因。',
      },
      {
        id: 2,
        role: 'assistant',
        text: '根因：下游支付网关证书于 14:31 过期，回调 TLS 握手全部失败。影响范围仅预发环境，生产未受波及。',
        reasoning: { content: '按时间窗聚类，错误集中在支付回调链路；对照发布记录，14:31 有一次证书轮换操作。', duration: 3.2 },
        tool: {
          name: 'search_logs',
          args: { service: 'paper-api', level: 'error', window: '30m' },
          result: '3 条错误 · 全部为回调 TLS 握手失败',
          status: 'completed',
          duration: 1240,
        },
      },
      {
        id: 3,
        role: 'assistant',
        text: '',
        tool: {
          name: 'rollback_deploy',
          args: { service: 'paper-api', target: 'v2.4.1' },
          status: 'waitingApproval',
        },
      },
    ],
  },
  {
    id: 'c2',
    title: '本周周报草稿',
    updatedAt: '昨天 18:05',
    messages: [
      {
        id: 4,
        role: 'user',
        text: '把这周的工作汇总成一页周报，先给要点。',
      },
      {
        id: 5,
        role: 'assistant',
        text: '本周要点：\n\n1. 组件库补齐 65 个组件的 a11y 与 SSR 测试，四类 spec 全绿。\n\n2. 文档站新增「构建块」板块，登录页 / 仪表盘 / AI 工作台可直接复制使用。\n\n3. 夜纸深色 Profile 上线，全站 token 联动切换。',
        reasoning: { content: '拉取本周的 issue、合并记录与部署时间线，按「质量 / 交付 / 体验」三个主题归组。', duration: 2.1 },
      },
    ],
  },
])

const activeId = ref('c1')
const active = computed(() => conversations.find((c) => c.id === activeId.value) ?? conversations[0])

const draft = ref('')
const busy = ref(false)

/* ── 顶部：模型与运行状态 ─────────────────────────────────── */

const model = ref<string | number>('glm-4.7')
const models: ModelSelectorModel[] = [
  { label: 'GLM-4.7', value: 'glm-4.7', provider: 'Z.ai' },
  { label: 'GLM-4.5-Air', value: 'glm-4.5-air', provider: 'Z.ai' },
  { label: 'GLM-4.6-Flash（维护中）', value: 'glm-4.6-flash', provider: 'Z.ai', disabled: true },
]

type AgentPhase = 'idle' | 'thinking' | 'tool' | 'answering'
const phase = ref<AgentPhase>('idle')

const agentView = computed(() => {
  switch (phase.value) {
    case 'thinking':
      return { status: 'running' as const, label: '思考中', detail: '正在拆解问题…' }
    case 'tool':
      return { status: 'toolRunning' as const, label: '调用工具', detail: 'search_logs 运行中' }
    case 'answering':
      return { status: 'streaming' as const, label: '生成回复', detail: '正在输出…' }
    default:
      return { status: 'completed' as const, label: '就绪', detail: '随时可以开始' }
  }
})

/* ── 演示生成链：思考 → 工具 → 流式回答 ───────────────────── */

const timers: number[] = []

function track(timer: number): number {
  timers.push(timer)
  return timer
}

function clearTimers(): void {
  // setTimeout / setInterval 句柄同池，clearInterval / clearTimeout 按 HTML 规范可互换
  while (timers.length > 0) {
    window.clearInterval(timers.pop())
  }
}

onBeforeUnmount(clearTimers)

function typeOut(message: ChatMessage, full: string, onDone: () => void): void {
  message.streaming = true
  const timer = track(window.setInterval(() => {
    message.text = full.slice(0, message.text.length + 2)
    if (message.text.length >= full.length) {
      window.clearInterval(timer)
      message.streaming = false
      onDone()
    }
  }, 40))
}

function send(text: string): void {
  const q = text.trim()
  if (q === '' || busy.value) return
  active.value.messages.push({ id: nextId(), role: 'user', text: q })
  draft.value = ''
  busy.value = true
  phase.value = 'thinking'

  // reactive 代理：生成链的 interval 闭包持有该引用持续写入，
  // 必须经代理修改才能触发视图更新（直接改 raw 对象不会通知依赖）
  const reply = reactive<ChatMessage>({
    id: nextId(),
    role: 'assistant',
    text: '',
    reasoning: { content: '', duration: 0 },
    reasoningLive: true,
  })
  active.value.messages.push(reply)

  const reasoningFull = `先检索「${q}」相关的记录，再决定是否需要调用工具核对细节。`
  track(window.setInterval(() => {
    reply.reasoning!.content = reasoningFull.slice(0, reply.reasoning!.content.length + 2)
    if (reply.reasoning!.content.length >= reasoningFull.length) {
      clearTimers()
      reply.reasoningLive = false
      reply.reasoning!.duration = 1.4
      phase.value = 'tool'
      reply.tool = { name: 'search_logs', args: { query: q, top: 5 }, status: 'running' }
      track(window.setTimeout(() => {
        reply.tool!.status = 'completed'
        reply.tool!.result = '2 条相关记录 · 已按时间倒序'
        reply.tool!.duration = 860
        phase.value = 'answering'
        typeOut(reply, `围绕「${q}」核对了两条记录，结论如下：\n\n1. 相关变更集中在今天上午，此前一周无异常。\n\n2. 建议先在预发环境复现并观察一个窗口，再决定是否推广到生产。`, () => {
          phase.value = 'idle'
          busy.value = false
        })
      }, 900))
    }
  }, 30))
}

function cancelGeneration(): void {
  clearTimers()
  const last = active.value.messages[active.value.messages.length - 1]
  if (last && last.role === 'assistant') {
    last.streaming = false
    last.reasoningLive = false
  }
  phase.value = 'idle'
  busy.value = false
  toast.warning('已停止生成本轮回复')
}

/* ── 会话切换与审批 ──────────────────────────────────────── */

function switchTo(id: string): void {
  if (id === activeId.value) return
  if (busy.value) cancelGeneration()
  activeId.value = id
}

function newConversation(): void {
  if (busy.value) cancelGeneration()
  const conversation: Conversation = { id: `c${nextId()}`, title: '新对话', updatedAt: '刚刚', messages: [] }
  conversations.unshift(conversation)
  activeId.value = conversation.id
}

function approveTool(message: ChatMessage): void {
  if (!message.tool) return
  message.tool.status = 'running'
  toast.info('回滚已开始：paper-api → v2.4.1')
  window.setTimeout(() => {
    message.tool!.status = 'completed'
    message.tool!.duration = 2130
    message.tool!.result = '回滚完成 · 预发环境恢复健康'
    message.text = '回滚已完成，预发环境错误率回落至基线。建议复查证书轮换流程后再重新发布。'
    toast.success('回滚完成，错误率已回落')
  }, 1600)
}

function rejectTool(message: ChatMessage): void {
  if (!message.tool) return
  message.tool.status = 'failed'
  toast.warning('已取消本次回滚操作')
}

/* ── 建议词 ─────────────────────────────────────────────── */

const suggestions: SuggestionItem[] = [
  { label: '汇总本周错误趋势', value: 'trend' },
  { label: '对比两次发布差异', value: 'diff' },
  { label: '生成回滚预案', value: 'rollback-plan' },
]
</script>

<template>
  <div class="ui-block-ai">
    <Layout class="ui-block-ai__shell">
      <LayoutSider collapsible aria-label="会话列表">
        <div class="ui-block-ai__sider">
          <Button variant="primary" block @click="newConversation">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </template>
            新建对话
          </Button>

          <ul class="ui-block-ai__conversations">
            <li v-for="conversation in conversations" :key="conversation.id">
              <button
                type="button"
                class="ui-block-ai__conversation"
                :class="{ 'ui-block-ai__conversation--on': conversation.id === activeId }"
                :aria-current="conversation.id === activeId ? 'true' : undefined"
                @click="switchTo(conversation.id)"
              >
                <span class="ui-block-ai__conversation-title">{{ conversation.title }}</span>
                <span class="ui-block-ai__conversation-time">{{ conversation.updatedAt }}</span>
              </button>
            </li>
          </ul>

          <div class="ui-block-ai__account">
            <Avatar name="林小满" alt="林小满" size="sm" />
            <div class="ui-block-ai__account-meta">
              <span class="ui-block-ai__account-name">林小满</span>
              <span class="ui-block-ai__account-plan">专业版</span>
            </div>
          </div>
        </div>
      </LayoutSider>

      <Layout>
        <LayoutHeader>
          <div class="ui-block-ai__header">
            <div class="ui-block-ai__heading">
              <h2 class="ui-block-ai__title">{{ active.title }}</h2>
              <span class="ui-block-ai__count">{{ active.messages.length }} 条消息</span>
            </div>
            <div class="ui-block-ai__controls">
              <ModelSelector v-model="model" :models="models" />
              <AgentStatus :status="agentView.status" :label="agentView.label" :detail="agentView.detail" />
            </div>
          </div>
        </LayoutHeader>

        <LayoutContent class="ui-block-ai__content">
          <MessageList class="ui-block-ai__log">
            <template v-for="message in active.messages" :key="message.id">
              <Message v-if="message.role === 'user'" role="user" name="我" status="sent">
                {{ message.text }}
              </Message>
              <Message v-else role="assistant" name="纸面助手">
                <Reasoning
                  v-if="message.reasoning"
                  :content="message.reasoning.content"
                  :streaming="message.reasoningLive === true"
                  :duration="message.reasoningLive === true ? undefined : message.reasoning.duration"
                />
                <ToolCallCard
                  v-if="message.tool"
                  :name="message.tool.name"
                  :args="message.tool.args"
                  :result="message.tool.result"
                  :status="message.tool.status"
                  :duration="message.tool.duration"
                  @approve="approveTool(message)"
                  @reject="rejectTool(message)"
                />
                <StreamingText v-if="message.text !== ''" :content="message.text" :streaming="message.streaming === true" markdown />
              </Message>
            </template>
          </MessageList>

          <div class="ui-block-ai__composer">
            <Suggestion :items="suggestions" :disabled="busy" @select="(item) => { draft = item.label }" />
            <PromptInput
              v-model="draft"
              placeholder="描述你的任务…（Enter 发送，Shift+Enter 换行）"
              :loading="busy"
              @submit="send"
              @cancel="cancelGeneration"
            />
          </div>
        </LayoutContent>
      </Layout>
    </Layout>

    <ToastHost />
  </div>
</template>

<style scoped>
.ui-block-ai {
  height: calc(var(--ui-space-8) * 10);
  background: var(--ui-bg);
}

.ui-block-ai__shell {
  height: 100%;
}

.ui-block-ai__sider {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  padding: var(--ui-space-3);
}

.ui-block-ai__conversations {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.ui-block-ai__conversation {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ui-space-1);
  width: 100%;
  padding: var(--ui-space-2);
  border: none;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-block-ai__conversation:hover {
  background: var(--ui-surface-muted);
}

.ui-block-ai__conversation--on {
  background: var(--ui-accent-soft);
}

.ui-block-ai__conversation-title {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.ui-block-ai__conversation--on .ui-block-ai__conversation-title {
  color: var(--ui-accent);
}

.ui-block-ai__conversation-time {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.ui-block-ai__account {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2);
  border-top: 1px solid var(--ui-border);
}

.ui-block-ai__account-meta {
  display: flex;
  flex-direction: column;
}

.ui-block-ai__account-name {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-1);
}

.ui-block-ai__account-plan {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.ui-block-ai__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  flex-wrap: wrap;
}

.ui-block-ai__heading {
  display: flex;
  align-items: baseline;
  gap: var(--ui-space-2);
  min-width: 0;
}

.ui-block-ai__title {
  margin: 0;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-block-ai__count {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  white-space: nowrap;
}

.ui-block-ai__controls {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
  flex-wrap: wrap;
}

.ui-block-ai__content {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.ui-block-ai__log {
  flex: 1;
  min-height: 0;
  padding: var(--ui-space-2) var(--ui-space-4);
}

.ui-block-ai__composer {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  padding: var(--ui-space-3) var(--ui-space-4);
  border-top: 1px solid var(--ui-border);
  background: var(--ui-surface);
}
</style>
