<script setup lang="ts">
/**
 * 首页「AI 工作台」实景区：一个可交互的 agent 排障会话面板。
 *
 * 面板内每个元素都是 @ui/components 的真实组件：ModelSelector / AgentStatus /
 * MessageList / Message / Reasoning / ToolCallCard / StreamingText / Suggestion /
 * PromptInput / toast。可玩的交互：批准或拒绝回滚、点建议回填输入框、提交指令。
 * 最后一条回复带打字机循环（onMounted 启动、卸载清理，SSR 安全）。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import {
  AgentStatus,
  Message,
  MessageList,
  ModelSelector,
  PromptInput,
  Reasoning,
  Statistic,
  StreamingText,
  Suggestion,
  ToastHost,
  ToolCallCard,
  toast,
} from '@ui/components'
import type {
  ModelSelectorModel,
  SuggestionItem,
  ToolCallStatus,
} from '@ui/components'

const { theme } = useData<{ homeDirectory?: { families: number; total: number } }>()
const directory = computed(
  () => theme.value.homeDirectory ?? { families: 0, total: 0 },
)

const model = ref<string>('glm-4.7')
const models: ModelSelectorModel[] = [
  { label: 'GLM-4.7', value: 'glm-4.7', provider: 'Z.ai' },
  { label: 'GLM-4.7-Air', value: 'glm-4.7-air', provider: 'Z.ai' },
  { label: 'GLM-4.6-Flash（维护中）', value: 'glm-4.6-flash', provider: 'Z.ai', disabled: true },
]

const draft = ref('')
const suggestions: SuggestionItem[] = [
  { label: '生成回滚工单', value: 'rollback-ticket' },
  { label: '查看证书详情', value: 'cert-detail' },
  { label: '通知值班同学', value: 'notify-oncall' },
]

const rollbackStatus = ref<ToolCallStatus>('waitingApproval')
function approveRollback(): void {
  rollbackStatus.value = 'running'
  toast.info('回滚已启动：paper-api → v2.4.1（演示）')
  window.setTimeout(() => {
    rollbackStatus.value = 'completed'
    toast.success('回滚完成，错误率已回落（演示）')
  }, 1600)
}
function rejectRollback(): void {
  rollbackStatus.value = 'failed'
  toast.warning('已拒绝回滚，转人工处理（演示）')
}

function onSuggest(item: SuggestionItem): void {
  draft.value = item.label
}
function onSubmit(value: string): void {
  const trimmed = value.trim()
  if (!trimmed) return
  toast.success(`指令已发出：${trimmed}（演示）`)
  draft.value = ''
}

/** 末条回复的打字机循环：一轮打完停留数秒后从头再来。 */
const tailScript =
  '已生成止血方案：先将 paper-api 回滚至 v2.4.1，再替换支付网关证书。等待你的批准。'
const tailText = ref('')
let tailCursor = 0
let tailTimer: number | undefined

function typeTail(): void {
  if (tailCursor <= tailScript.length) {
    tailText.value = tailScript.slice(0, tailCursor)
    tailCursor += 1
    tailTimer = window.setTimeout(typeTail, 42)
  } else {
    tailTimer = window.setTimeout(() => {
      tailCursor = 0
      typeTail()
    }, 3600)
  }
}

onMounted(() => typeTail())
onBeforeUnmount(() => {
  if (tailTimer !== undefined) window.clearTimeout(tailTimer)
})

/** 侧栏拼装清单：面板里出现的组件与其文档页。 */
const parts: Array<{ name: string; note: string; link: string }> = [
  { name: 'ModelSelector', note: '模型切换', link: '/components/inputs/model-selector' },
  { name: 'AgentStatus', note: '生命周期状态', link: '/components/feedback/agent-status' },
  { name: 'MessageList', note: '会话流容器', link: '/components/data/message-list' },
  { name: 'Message', note: '消息气泡', link: '/components/data/message' },
  { name: 'Reasoning', note: '思考过程', link: '/components/feedback/reasoning' },
  { name: 'ToolCallCard', note: '工具调用 / 审批', link: '/components/data/tool-call-card' },
  { name: 'StreamingText', note: '流式正文', link: '/components/data/streaming-text' },
  { name: 'Suggestion', note: '建议指令', link: '/components/inputs/suggestion' },
  { name: 'PromptInput', note: '指令输入', link: '/components/inputs/prompt-input' },
  { name: 'Toast', note: '命令式通知', link: '/components/feedback/toast' },
]
</script>

<template>
  <section class="ui-workbench">
    <header class="ui-workbench__head">
      <h2>AI 工作台，先看实景</h2>
      <p>
        这不是截图：模型选择、思考过程、工具调用审批、流式输出、建议指令，每个元素都是活的纸面组件。
      </p>
    </header>

    <div class="ui-workbench__shell">
      <div class="ui-workbench__console">
        <div class="ui-workbench__bar">
          <ModelSelector v-model="model" :models="models" />
          <AgentStatus status="streaming" detail="正在生成回复…" />
        </div>

        <MessageList class="ui-workbench__log">
          <Message role="user" name="开发者" timestamp="14:31" status="sent">
            预发环境 14:30 之后错误率抬升，帮我定位根因。
          </Message>

          <Message role="assistant" name="纸面助手" timestamp="14:31">
            <Reasoning
              :duration="3.2"
              content="按时间窗聚类，错误集中在 14:31–14:33；全部指向支付回调链路，先查下游证书与 TLS 握手。"
            />
            <ToolCallCard
              name="search_logs"
              status="completed"
              :duration="1240"
              :args="{ service: 'paper-api', level: 'error', window: '30m' }"
              result="3 条错误 · 全部为回调 TLS 握手失败"
            />
            <StreamingText
              content="根因：下游支付网关证书于 14:31 过期，支付回调批量握手失败。建议回滚止血后更换证书。"
            />
          </Message>

          <Message role="assistant" name="纸面助手" timestamp="14:32">
            <ToolCallCard
              name="rollback_deploy"
              :status="rollbackStatus"
              :args="{ service: 'paper-api', target: 'v2.4.1' }"
              @approve="approveRollback"
              @reject="rejectRollback"
            />
            <StreamingText :content="tailText" streaming />
          </Message>
        </MessageList>

        <div class="ui-workbench__composer">
          <Suggestion :items="suggestions" @select="onSuggest" />
          <PromptInput
            v-model="draft"
            placeholder="给纸面助手下一条指令…（Enter 发送）"
            @submit="onSubmit"
          />
        </div>
      </div>

      <aside class="ui-workbench__side">
        <h3>这块面板由 {{ parts.length }} 个组件拼成</h3>
        <ul class="ui-workbench__parts">
          <li v-for="part in parts" :key="part.link">
            <a :href="withBase(part.link)">
              {{ part.name }}<span>{{ part.note }}</span>
            </a>
          </li>
        </ul>
        <div class="ui-workbench__stats">
          <Statistic title="组件" :value="directory.total" />
          <Statistic title="家族" :value="directory.families" />
          <Statistic title="裸视觉值" :value="0" />
        </div>
      </aside>
    </div>

    <ToastHost />
  </section>
</template>

<style scoped>
.ui-workbench {
  margin-top: var(--ui-space-8);
}

.ui-workbench__head h2 {
  margin: 0 0 var(--ui-space-2);
  font-size: var(--ui-text-2xl);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
  letter-spacing: -0.4px;
}

.ui-workbench__head p {
  margin: 0 0 var(--ui-space-5);
  font-size: var(--ui-text-md);
  color: var(--ui-text-2);
  max-width: 640px;
}

.ui-workbench__shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 288px;
  gap: var(--ui-space-4);
  align-items: stretch;
}

@media (max-width: 960px) {
  .ui-workbench__shell {
    grid-template-columns: 1fr;
  }
}

.ui-workbench__console {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-rest);
  padding: var(--ui-space-4);
  gap: var(--ui-space-3);
}

.ui-workbench__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  flex-wrap: wrap;
}

.ui-workbench__log {
  height: 420px;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-bg);
  padding: var(--ui-space-3);
}

.ui-workbench__composer {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.ui-workbench__side {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-rest);
  padding: var(--ui-space-4);
  gap: var(--ui-space-3);
}

.ui-workbench__side h3 {
  margin: 0;
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-2);
}

.ui-workbench__parts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}

.ui-workbench__parts a {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ui-space-2);
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
  text-decoration: none;
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-workbench__parts a:hover {
  background: var(--ui-surface-muted);
}

.ui-workbench__parts a span {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.ui-workbench__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ui-space-2);
  margin-top: auto;
  padding-top: var(--ui-space-3);
  border-top: 1px solid var(--ui-border);
}
</style>
