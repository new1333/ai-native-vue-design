<script setup lang="ts">
import { ref, watch } from 'vue'
import { highlight } from '../highlight'

const props = defineProps<{
  /** demo 源码（由页面以 `xxx.vue?raw` 导入后传入，保证预览与源码同源） */
  src: string
  /** 语法高亮语言（shiki lang id），demo 默认 vue */
  lang?: string
  title?: string
  description?: string
}>()

const showSource = ref(false)
const copied = ref(false)
const highlighted = ref('')
const highlighting = ref(false)

// 首次展开时才做语法高亮（shiki 按需加载），结果缓存
watch(showSource, async (open) => {
  if (!open || highlighted.value || highlighting.value) return
  highlighting.value = true
  try {
    highlighted.value = await highlight(props.src, props.lang ?? 'vue')
  } finally {
    highlighting.value = false
  }
})

async function copySource(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.src)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // 剪贴板不可用（非安全上下文等）时静默降级：用户仍可展开源码手动复制
  }
}
</script>

<template>
  <section class="ui-docs-demo">
    <header v-if="title || description" class="ui-docs-demo__head">
      <p v-if="title" class="ui-docs-demo__title">{{ title }}</p>
      <p v-if="description" class="ui-docs-demo__desc">{{ description }}</p>
    </header>
    <div class="ui-docs-demo__preview">
      <slot />
    </div>
    <div class="ui-docs-demo__bar">
      <button type="button" class="ui-docs-demo__action" @click="showSource = !showSource">
        {{ showSource ? '收起源码' : '查看源码' }}
      </button>
      <button type="button" class="ui-docs-demo__action" @click="copySource">
        {{ copied ? '已复制' : '复制源码' }}
      </button>
    </div>
    <div v-if="showSource" class="ui-docs-demo__code">
      <span v-if="highlighting" class="ui-docs-demo__loading">高亮加载中…</span>
      <!-- v-html 为 shiki 输出（本仓库 demo 源码，可信内容） -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else v-html="highlighted" />
    </div>
  </section>
</template>

<style scoped>
.ui-docs-demo {
  margin: var(--ui-space-5) 0;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-rest);
}

.ui-docs-demo__head {
  padding: var(--ui-space-4) var(--ui-space-5) 0;
}

.ui-docs-demo__title {
  margin: 0;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.ui-docs-demo__desc {
  margin: var(--ui-space-1) 0 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-docs-demo__preview {
  padding: var(--ui-space-5);
}

.ui-docs-demo__bar {
  display: flex;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-3);
  border-top: 1px solid var(--ui-border);
  background: var(--ui-surface-muted);
  border-radius: 0 0 var(--ui-radius-md) var(--ui-radius-md);
}

.ui-docs-demo__action {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out),
    background var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-demo__action:hover {
  color: var(--ui-text-1);
  background: var(--ui-bg);
}

.ui-docs-demo__code {
  padding: var(--ui-space-4) var(--ui-space-5);
  border-top: 1px solid var(--ui-border);
  background: var(--ui-color-ink-950);
  color: var(--ui-color-paper);
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  overflow-x: auto;
  border-radius: 0 0 var(--ui-radius-md) var(--ui-radius-md);
}

/* shiki pre 自带 inline 背景（github-dark 默认底）：统一压回 ink-950 token */
.ui-docs-demo__code :deep(pre.shiki) {
  margin: 0;
  padding: 0;
  background-color: var(--ui-color-ink-950) !important;
}

.ui-docs-demo__loading {
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
}
</style>
