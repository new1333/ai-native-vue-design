<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button, ToggleGroup } from '@ui/components'
import type { ToggleItemOption, ToggleValue } from '@ui/components'
import { highlight } from '../highlight'

type StageWidth = 'desktop' | 'tablet' | 'mobile'

const props = defineProps<{
  /** block 源码（由页面以 `xxx.vue?raw` 导入后传入，保证预览与源码同源） */
  src: string
  title?: string
  description?: string
}>()

/* 平板 / 手机档为设备视口宽度（功能断点，同 Layout 的折叠断点），非视觉 token */
const WIDTH_OPTIONS: ReadonlyArray<{ mode: StageWidth; label: string; width: string }> = [
  { mode: 'desktop', label: '桌面', width: '100%' },
  { mode: 'tablet', label: '平板', width: '768px' },
  { mode: 'mobile', label: '手机', width: '390px' },
]

const WIDTH_ITEMS: ToggleItemOption[] = WIDTH_OPTIONS.map(({ mode, label }) => ({
  value: mode,
  label,
}))

const stageWidth = ref<StageWidth>('desktop')
const activeWidth = computed(() => WIDTH_OPTIONS.find((option) => option.mode === stageWidth.value))

/* ToggleGroup 的载荷是 ToggleValue（single 下实为 string），收窄回 StageWidth */
const stageWidthModel = computed<ToggleValue | ToggleValue[]>({
  get: () => stageWidth.value,
  set: (value) => {
    const found = WIDTH_OPTIONS.find((option) => option.mode === value)
    if (found) stageWidth.value = found.mode
  },
})

const frame = ref<HTMLElement | null>(null)

/**
 * 阅读区破出：文档正文列两侧常有固定文档侧栏（左）与本页目录（右），
 * 预览要铺满的是**两者之间的阅读区**，而不是整个视口——纯 CSS 的
 * calc(50% - 50vw) 负边距既会随正文列偏移，也会把 block 内容滑到两栏
 * 下方被遮住。挂载后实测两栏占位与帧位置，用左右负边距对齐阅读区边缘
 * （各让一个 --ui-space-2 呼吸）；窄屏两栏隐藏时退化为对齐视口两侧。
 * 仅在 onMounted / resize 中访问布局 API，SSR 安全。
 */
function syncFrameBreakout(): void {
  const el = frame.value
  if (!el) return
  el.style.marginLeft = ''
  el.style.marginRight = ''
  const rect = el.getBoundingClientRect()
  const viewportWidth = document.documentElement.clientWidth
  const inset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-space-2')) || 8
  const sidebar = document.querySelector('.VPSidebar')
  const aside = document.querySelector('.content-container ~ .aside, .aside')
  const leftBound =
    sidebar && getComputedStyle(sidebar).display !== 'none'
      ? sidebar.getBoundingClientRect().right + inset
      : inset
  const rightBound =
    aside && getComputedStyle(aside).display !== 'none'
      ? aside.getBoundingClientRect().left - inset
      : viewportWidth - inset
  el.style.marginLeft = `${Math.max(leftBound, inset) - rect.left}px`
  el.style.marginRight = `${rect.right - rightBound}px`
}

function onResize(): void {
  syncFrameBreakout()
}

onMounted(() => {
  syncFrameBreakout()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

const showSource = ref(false)
const copied = ref(false)
const highlighted = ref('')
const highlighting = ref(false)

// 首次展开时才做语法高亮（shiki 按需加载），结果缓存
watch(showSource, async (open) => {
  if (!open || highlighted.value || highlighting.value) return
  highlighting.value = true
  try {
    highlighted.value = await highlight(props.src, 'vue')
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
  <section class="ui-block-preview">
    <header v-if="title || description" class="ui-block-preview__head">
      <p v-if="title" class="ui-block-preview__title">{{ title }}</p>
      <p v-if="description" class="ui-block-preview__desc">{{ description }}</p>
    </header>
    <div ref="frame" class="ui-block-preview__frame">
      <div class="ui-block-preview__card">
        <div class="ui-block-preview__toolbar">
          <ToggleGroup
            v-model="stageWidthModel"
            class="ui-block-preview__widths"
            :items="WIDTH_ITEMS"
            aria-label="预览宽度切换"
          >
            <template #item="{ item }">
              <span class="ui-block-preview__segment">
                <svg
                  v-if="item.value === 'desktop'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="2.5" y="4" width="19" height="12.5" rx="1.5" />
                  <path d="M9 20h6" />
                  <path d="M12 16.5V20" />
                </svg>
                <svg
                  v-else-if="item.value === 'tablet'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="5" y="3" width="14" height="18" rx="1.5" />
                  <path d="M11 17.8h2" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="7.5" y="2.5" width="9" height="19" rx="1.5" />
                  <path d="M11 18.3h2" />
                </svg>
                <span>{{ item.label }}</span>
              </span>
            </template>
          </ToggleGroup>
          <div class="ui-block-preview__ops">
            <Button size="sm" variant="ghost" @click="showSource = !showSource">
              <template #icon>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m8 8-4.5 4L8 16" />
                  <path d="m16 8 4.5 4L16 16" />
                </svg>
              </template>
              {{ showSource ? '收起源码' : '查看源码' }}
            </Button>
            <Button size="sm" variant="ghost" @click="copySource">
              <template #icon>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="9" y="9" width="11" height="11" rx="1.5" />
                  <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
                </svg>
              </template>
              {{ copied ? '已复制' : '复制源码' }}
            </Button>
          </div>
        </div>
        <div class="ui-block-preview__mat">
          <div
            class="ui-block-preview__stage"
            :class="{ 'ui-block-preview__stage--device': stageWidth !== 'desktop' }"
            :style="{ width: activeWidth?.width }"
          >
            <slot />
          </div>
        </div>
        <div v-if="showSource" class="ui-block-preview__code">
          <span v-if="highlighting" class="ui-block-preview__loading">高亮加载中…</span>
          <!-- v-html 为 shiki 输出（本仓库 block 源码，可信内容） -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-else v-html="highlighted" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ui-block-preview {
  margin: var(--ui-space-5) 0;
}

.ui-block-preview__head {
  margin-bottom: var(--ui-space-3);
}

.ui-block-preview__title {
  margin: 0;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.ui-block-preview__desc {
  margin: var(--ui-space-1) 0 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

/* 满宽破出的落点（见 syncFrameBreakout）：卡片整体作为一块文档控件呈现 */
.ui-block-preview__card {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow-rest);
  overflow: clip;
}

/* 工具栏内嵌卡片顶栏：宽度切换与源码操作贴着它们控制的舞台；
   窄屏放不下时 ops 组换行右对齐，不横向溢出 */
.ui-block-preview__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-3);
  border-bottom: 1px solid var(--ui-border);
}

.ui-block-preview__segment {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
}

.ui-block-preview__segment svg {
  width: 16px;
  height: 16px;
}

.ui-block-preview__ops {
  display: flex;
  gap: var(--ui-space-1);
}

/* 舞台衬底：sand 质感底座，页面级 stage（--ui-bg）浮于其上，自身滚动 */
.ui-block-preview__mat {
  min-height: calc(var(--ui-space-8) * 9);
  padding: var(--ui-space-4);
  background: var(--ui-surface-muted);
  overflow: auto;
  max-height: calc(var(--ui-space-8) * 13);
}

.ui-block-preview__stage {
  max-width: 100%;
  margin-inline: auto;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  transition: width var(--ui-motion-default) var(--ui-ease-out),
    box-shadow var(--ui-motion-default) var(--ui-ease-out);
}

/* 设备档（平板 / 手机）：stage 收窄为浮起的设备面板 */
.ui-block-preview__stage--device {
  box-shadow: var(--ui-shadow-pop);
}

.ui-block-preview__code {
  padding: var(--ui-space-4) var(--ui-space-5);
  border-top: 1px solid var(--ui-border);
  background: var(--ui-color-ink-950);
  color: var(--ui-color-paper);
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  overflow-x: auto;
  max-height: calc(var(--ui-space-8) * 12);
  overflow-y: auto;
}

/* shiki pre 自带 inline 背景（github-dark 默认底）：统一压回 ink-950 token */
.ui-block-preview__code :deep(pre.shiki) {
  margin: 0;
  padding: 0;
  background-color: var(--ui-color-ink-950) !important;
}

.ui-block-preview__loading {
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
}
</style>
