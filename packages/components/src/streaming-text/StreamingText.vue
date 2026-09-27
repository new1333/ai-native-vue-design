<script setup lang="ts">
/**
 * StreamingText —— AI 流式文本渲染：增量 token 上屏与完成定格（设计文档 §14.2 Response 首位）。
 *
 * - content 为增量全文（累计文本）：挂载时已有内容视为已上屏（与 SSR 直出一致，纯增量语义）；
 *   streaming 期间 content 新增部分按节拍逐步上屏；content 长度回落视为新一轮重置，从零重新上屏。
 * - streaming true→false：未上屏余量立即定格、移除光标并派发一次 complete（完成定格）。
 * - markdown：按空行切分原生 p 段落、段内换行以 pre-wrap 保留；不做完整 Markdown 语法解析，
 *   完整渲染请用 default 插槽接外部渲染器（作用域提供已上屏 text 与 streaming）。
 * - 无障碍：根元素 aria-live="polite"（流式中 aria-busy="true" 屏蔽逐 token 播报，
 *   定格后恢复播报最终态）；光标为装饰（aria-hidden）。纯展示组件：不可聚焦、无键盘路径。
 * - SSR：setup 与模块顶层不访问浏览器 API；节拍器（setInterval，宿主通用定时器，非浏览器
 *   全局对象）仅在客户端增量阶段由 watcher 启动，追平/定格/卸载即清理，node renderToString 无异常。
 * - 视觉只消费 var(--ui-*) token（paper.css）；不引入 CSS 动画，无动效时长取值。
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  STREAMING_TEXT_REVEAL_CATCHUP_TICKS,
  STREAMING_TEXT_REVEAL_CHARS_MIN,
  STREAMING_TEXT_REVEAL_TICK_MS,
  STREAMING_TEXT_STATE_DONE,
  STREAMING_TEXT_STATE_STREAMING,
} from './StreamingText.constants'
import type { StreamingTextEmits, StreamingTextProps, StreamingTextSlots } from './StreamingText.types'

const props = withDefaults(defineProps<StreamingTextProps>(), {
  streaming: false,
  markdown: false,
})
const emit = defineEmits<StreamingTextEmits>()
defineSlots<StreamingTextSlots>()

/** 已上屏字符数：初始即 content 全长（挂载时已有内容不回放，与 SSR 直出保持一致）。 */
const revealedCount = ref(props.content.length)

/** 已上屏文本。 */
const revealedText = computed(() => props.content.slice(0, revealedCount.value))

/** markdown 段落：按空行（≥2 个换行）切分；段内换行由段落自身的 pre-wrap 保留。 */
const markdownParagraphs = computed(() =>
  props.markdown ? revealedText.value.split(/\n{2,}/) : [],
)

/** 末段下标：光标驻留在最后一个段落内（跟随流式尾部）。 */
const lastParagraphIndex = computed(() => markdownParagraphs.value.length - 1)

/** 显示态修饰类：流式 / 完成定格。 */
const stateClass = computed(() =>
  props.streaming
    ? `ui-streaming-text--${STREAMING_TEXT_STATE_STREAMING}`
    : `ui-streaming-text--${STREAMING_TEXT_STATE_DONE}`,
)

/** 流式光标仅在 streaming 期间渲染；定格后移除。 */
const showCursor = computed(() => props.streaming)

/** aria-busy：流式中屏蔽读屏逐 token 播报，定格后恢复播报最终态。 */
const ariaBusy = computed(() => (props.streaming ? 'true' : 'false'))

/**
 * 上屏节拍器：reveal 循环收口。只在「客户端 + 有未上屏增量」时存在；
 * 追平、定格、卸载三种路径都会清理。setInterval 为宿主通用定时器，
 * 不属于 window/document 等浏览器全局对象，且 SSR 渲染期 watcher 不会触发。
 */
let revealTimer: ReturnType<typeof setInterval> | null = null
/** 每拍上屏字符数：在内容变化（syncRevealState）时按当时增量定档，循环期间保持恒定。 */
let revealRate = STREAMING_TEXT_REVEAL_CHARS_MIN

function stopRevealTimer(): void {
  if (revealTimer !== null) {
    clearInterval(revealTimer)
    revealTimer = null
  }
}

function revealTick(): void {
  if (revealedCount.value >= props.content.length) {
    stopRevealTimer()
    return
  }
  revealedCount.value = Math.min(props.content.length, revealedCount.value + revealRate)
  if (revealedCount.value >= props.content.length) stopRevealTimer()
}

function startRevealTimer(): void {
  if (revealTimer === null) {
    revealTimer = setInterval(revealTick, STREAMING_TEXT_REVEAL_TICK_MS)
  }
}

/** 依据 streaming / content 现状收敛上屏状态（watcher 统一收口，幂等）。 */
function syncRevealState(): void {
  if (!props.streaming) {
    // 完成定格：未上屏余量立即定格（不逐字播放完），光标移除。
    revealedCount.value = props.content.length
    stopRevealTimer()
    return
  }
  // 流式中：content 长度回落视为新一轮重置，从零按节拍重新上屏。
  if (props.content.length < revealedCount.value) {
    revealedCount.value = 0
  }
  const remaining = props.content.length - revealedCount.value
  if (remaining > 0) {
    // 速率按「当前未上屏增量」定档：把增量均摊到 CATCHUP_TICKS 拍内追平，
    // 大段 token 突刺也能在固定拍数内完成上屏（不能逐拍重算，否则衰减追不平）。
    revealRate = Math.max(
      STREAMING_TEXT_REVEAL_CHARS_MIN,
      Math.ceil(remaining / STREAMING_TEXT_REVEAL_CATCHUP_TICKS),
    )
    startRevealTimer()
  } else {
    stopRevealTimer()
  }
}

watch(() => props.content, syncRevealState)

watch(
  () => props.streaming,
  (streaming, prevStreaming) => {
    syncRevealState()
    // 流结束（true→false）即完成定格：派发一次 complete；false→true 的开始不派发。
    if (prevStreaming && !streaming) emit('complete')
  },
)

onBeforeUnmount(stopRevealTimer)

const classes = computed(() => [
  'ui-streaming-text',
  stateClass.value,
  { 'ui-streaming-text--markdown': props.markdown },
])
</script>

<template>
  <div :class="classes" aria-live="polite" :aria-busy="ariaBusy">
    <!-- 自定义渲染：接管已上屏文本（内置纯文本/段落结构不渲染），光标仍由组件收口 -->
    <slot v-if="$slots.default" :text="revealedText" :streaming="streaming" />
    <template v-else-if="markdown">
      <p v-for="(paragraph, index) in markdownParagraphs" :key="index" class="ui-streaming-text__paragraph">{{ paragraph }}<span v-if="index === lastParagraphIndex && showCursor" class="ui-streaming-text__cursor" aria-hidden="true"><slot name="cursor"><span class="ui-streaming-text__caret"></span></slot></span></p>
    </template>
    <template v-else>{{ revealedText }}</template>
    <!-- 非 markdown 段落模式（含 default 插槽接管渲染）：光标作为根级兄弟元素驻留尾部 -->
    <span v-if="showCursor && ($slots.default || !markdown)" class="ui-streaming-text__cursor" aria-hidden="true"><slot name="cursor"><span class="ui-streaming-text__caret"></span></slot></span>
  </div>
</template>

<style scoped>
/* ── 基底：正文排版基线（字号/行高/颜色全部走 token）───────────────────── */
.ui-streaming-text {
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-1);
  /* 纯文本模式：保留流式增量中的换行与连续空格（代码/列表缩进不塌陷） */
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

/* markdown 段落模式：根不再保留空白（空行已切分为段落边界，由段落自行 pre-wrap） */
.ui-streaming-text--markdown {
  white-space: normal;
}

.ui-streaming-text__paragraph {
  margin: 0;
  white-space: pre-wrap;
}

.ui-streaming-text__paragraph + .ui-streaming-text__paragraph {
  margin-top: var(--ui-space-3);
}

/* ── 流式光标：装饰性（aria-hidden），默认块状插入符 ─────────────────────
   不引入闪烁动画：闪烁属低频动效，token 层暂无慢速档（--ui-motion-fast/default
   均 <200ms），为不写死动效时长默认光标为静态插入符；reduced-motion 的 token
   归零机制天然覆盖使用方经 cursor 插槽注入的任何 token 化动效。 */
.ui-streaming-text__cursor {
  display: inline;
}

.ui-streaming-text__caret {
  display: inline-block;
  /* 宽高以 em 相对字号度量：随字阶缩放的结构度量（非固定像素视觉值） */
  width: 0.5em;
  height: 1em;
  vertical-align: text-bottom;
  background: var(--ui-accent);
  border-radius: var(--ui-radius-xs);
}
</style>
