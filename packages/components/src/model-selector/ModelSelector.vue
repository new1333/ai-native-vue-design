<script setup lang="ts">
/**
 * ModelSelector —— AI 模型切换器：会话/输入区选择当前模型（设计文档 §14.1 Interaction 点名）。
 *
 * - 复用 Select 的键盘与浮层纪律：触发器（combobox 语义）+ Teleport 弹层面板
 *   （内含仅承载 option 的 listbox 滚动区）+ aria-activedescendant 焦点模型；状态机在
 *   useModelSelector.ts（纯逻辑，无 DOM），本组件只承接 DOM 副作用：弹层定位、document
 *   点击外部关闭、焦点管理。
 * - 模型提供方（provider）以 badge 形态徽标呈现（设计文档 §14.1 点名 Badge 形态），
 *   直接复用 Badge 组件（同包内组合，先例 Dialog → Button）。
 * - 加载态（loading）：弹层显示 loadingText、拦截一切选中路径（与 Suggestion 同纪律），
 *   根级 aria-busy="true"；loading/empty 提示行置于 listbox 之外（WAI-ARIA listbox
 *   直接子元素仅允许 option/group，同 CommandPalette 先例），loading 行带 role="status"；
 *   SSR：浮层仅客户端渲染（mounted 门控 + Teleport）。
 * - 一切颜色、字号、间距、圆角、阴影、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Badge } from '../badge'
import {
  MODEL_SELECTOR_EMPTY_TEXT_DEFAULT,
  MODEL_SELECTOR_LOADING_TEXT_DEFAULT,
  MODEL_SELECTOR_PLACEHOLDER_DEFAULT,
} from './ModelSelector.constants'
import { useModelSelector } from './useModelSelector'
import type {
  ModelSelectorEmits,
  ModelSelectorExpose,
  ModelSelectorProps,
  ModelSelectorSlots,
} from './ModelSelector.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ModelSelectorProps>(), {
  modelValue: null,
  models: () => [],
  placeholder: MODEL_SELECTOR_PLACEHOLDER_DEFAULT,
  emptyText: MODEL_SELECTOR_EMPTY_TEXT_DEFAULT,
  loadingText: MODEL_SELECTOR_LOADING_TEXT_DEFAULT,
  disabled: false,
  loading: false,
})
const emit = defineEmits<ModelSelectorEmits>()
defineSlots<ModelSelectorSlots>()

/** 弹层与选项的 DOM id（useId 保证 SSR/客户端一致、多实例唯一）。 */
const listboxId = `ui-model-selector-listbox-${useId()}`

const { open, activeIndex, selectedModel, toggleList, closeList, select, handleKeydown } =
  useModelSelector({
    models: () => props.models,
    modelValue: () => props.modelValue,
    disabled: () => props.disabled,
    loading: () => props.loading,
    onSelect: (model) => {
      emit('update:modelValue', model.value)
      emit('change', model)
    },
  })

const rootClasses = computed(() => [
  'ui-model-selector',
  {
    'ui-model-selector--open': open.value,
    'ui-model-selector--disabled': props.disabled,
    'ui-model-selector--loading': props.loading,
  },
])

/** 触发器文案：已选模型名，否则 placeholder（走占位样式）。 */
const displayLabel = computed(() => selectedModel.value?.label ?? props.placeholder)
const showPlaceholder = computed(() => selectedModel.value === null)

/** aria-activedescendant：仅打开且有高亮时指向选项 id，否则不出现在 DOM。 */
const activeDescendantId = computed(() =>
  open.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
)

function optionId(index: number): string {
  return `${listboxId}-option-${index}`
}

const rootEl = ref<HTMLDivElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
/** 弹层面板（listbox 与 loading/empty 提示行的共同容器），用于点击外部关闭的包含判断。 */
const popupEl = ref<HTMLDivElement | null>(null)

/** 浮层仅客户端：SSR 输出中不出现弹层。 */
const mounted = ref(false)

/** 弹层内联定位：打开时按触发器 rect + 页面滚动偏移计算（文档坐标 top/left + minWidth）。 */
const popupStyle = ref<Record<string, string>>({})

function updatePosition(): void {
  const trigger = triggerEl.value
  if (!trigger) return
  // getBoundingClientRect() 为视口坐标；弹层 Teleport 到 body 下绝对定位，包含块是
  // 初始包含块（文档原点），须加 window.scrollX/scrollY 换算为文档坐标——否则页面
  // 滚动后打开时面板漂到文档顶部。打开期间弹层与文档同滚，无需滚动监听跟随。
  // 仅在 open 变 true 后的 nextTick（客户端交互路径）触达 window，SSR 不经过此处。
  const rect = trigger.getBoundingClientRect()
  popupStyle.value = {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    minWidth: `${rect.width}px`,
  }
}

watch(open, (isOpen) => {
  if (isOpen) void nextTick(updatePosition)
})

function onTriggerBlur(): void {
  // Tab 离开触发器即关闭弹层（选项点击路径已被弹层 mousedown.prevent 保住焦点）。
  if (open.value) closeList()
}

function onOptionClick(index: number): void {
  select(index)
}

/** 点击外部关闭：目标在根容器或弹层面板内则交由内部处理器，否则关闭。 */
function onDocumentClick(event: MouseEvent): void {
  if (!open.value) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (rootEl.value?.contains(target) || popupEl.value?.contains(target)) return
  closeList()
}

onMounted(() => {
  mounted.value = true
  document.addEventListener('click', onDocumentClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick, true)
})

function focus(options?: FocusOptions): void {
  triggerEl.value?.focus(options)
}

function blur(): void {
  triggerEl.value?.blur()
}

defineExpose<ModelSelectorExpose>({ focus, blur })
</script>

<template>
  <div ref="rootEl" :class="rootClasses" :aria-busy="loading ? 'true' : undefined">
    <button
      ref="triggerEl"
      type="button"
      class="ui-model-selector__trigger"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listboxId"
      :aria-activedescendant="activeDescendantId"
      :disabled="disabled"
      v-bind="$attrs"
      @click="toggleList"
      @keydown="handleKeydown"
      @blur="onTriggerBlur"
    >
      <slot name="trigger" :model="selectedModel" :open="open">
        <span class="ui-model-selector__value">
          <Badge
            v-if="selectedModel?.provider"
            class="ui-model-selector__badge"
            variant="neutral"
          >{{ selectedModel.provider }}</Badge>
          <span
            class="ui-model-selector__label"
            :class="{ 'ui-model-selector__label--placeholder': showPlaceholder }"
          >
            {{ displayLabel }}
          </span>
        </span>
        <svg
          class="ui-model-selector__chevron"
          :class="{ 'ui-model-selector__chevron--open': open }"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </slot>
    </button>
    <Teleport v-if="mounted && open" to="body">
      <div
        ref="popupEl"
        class="ui-model-selector__popup"
        :style="popupStyle"
        @mousedown.prevent
      >
        <div :id="listboxId" class="ui-model-selector__listbox" role="listbox">
          <template v-if="!loading">
            <div
              v-for="(model, index) in models"
              :id="optionId(index)"
              :key="model.value"
              class="ui-model-selector__option"
              :class="{ 'ui-model-selector__option--active': index === activeIndex }"
              role="option"
              :aria-selected="model.value === modelValue ? 'true' : 'false'"
              :aria-disabled="model.disabled === true ? 'true' : undefined"
              @click="onOptionClick(index)"
            >
              <slot
                name="option"
                :model="model"
                :index="index"
                :selected="model.value === modelValue"
                :active="index === activeIndex"
              >
                <Badge
                  v-if="model.provider"
                  class="ui-model-selector__badge"
                  variant="neutral"
                >{{ model.provider }}</Badge>
                <span class="ui-model-selector__option-label">{{ model.label }}</span>
              </slot>
            </div>
          </template>
        </div>
        <!-- loading/empty 提示行是 listbox 的兄弟节点：WAI-ARIA listbox 的直接子元素
             仅允许 option/group（同 CommandPalette 先例）；loading 行以 role="status" 暴露 -->
        <div v-if="loading" class="ui-model-selector__loading" role="status">{{ loadingText }}</div>
        <div v-else-if="models.length === 0" class="ui-model-selector__empty">{{ emptyText }}</div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── 根容器：相对定位锚点（弹层的定位参照） ───────────────── */
.ui-model-selector {
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  font-family: var(--ui-font-sans);
}

/* ── 触发器：input 别名底 + line 描边，语义为 combobox ─────── */
.ui-model-selector__trigger {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Select/Input 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  padding: var(--ui-space-2) var(--ui-space-3);
  font-family: inherit;
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out),
    color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-model-selector__trigger:hover:not(:disabled) {
  border-color: var(--ui-border-strong);
}

/* focus：焦点环由全局 :focus-visible 约定提供（paper.css，不改写 outline），
   容器描边同步转 accent 别名 --ui-input-border-focus */
.ui-model-selector__trigger:focus-visible {
  border-color: var(--ui-input-border-focus);
}

/* ── disabled：sand 底 + text-3 + not-allowed（原生 disabled 已移出 Tab 序） ── */
.ui-model-selector__trigger:disabled {
  background-color: var(--ui-surface-muted);
  border-color: var(--ui-border);
  color: var(--ui-text-3);
  cursor: not-allowed;
}

/* ── 触发器内容区：provider 徽标 + 模型名，长文本省略 ─────── */
.ui-model-selector__value {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--ui-space-2);
}

.ui-model-selector__badge {
  flex: none;
}

.ui-model-selector__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-model-selector__label--placeholder {
  color: var(--ui-text-3);
}

/* ── 折叠箭标：open 时翻转（结构性 transform，时长走 token） ── */
.ui-model-selector__chevron {
  flex: none;
  color: var(--ui-text-3);
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-model-selector__chevron--open {
  transform: rotate(180deg);
}

/* ── 弹层面板：Teleport body + 绝对定位（top/left/minWidth 由打开时的触发器
   rect + 页面滚动偏移换算的文档坐标内联写入）；与触发器的间距走 margin-top token。
   面板承载 surface/描边/阴影，listbox 滚动区与 loading/empty 提示行都是它的直接
   子元素（提示行置于 listbox 外：WAI-ARIA listbox 仅允许 option/group 子元素） ── */
.ui-model-selector__popup {
  position: absolute;
  /* 坐标原点为结构性取值，实际 top/left 由内联定位覆盖 */
  top: 0;
  left: 0;
  margin-top: var(--ui-space-1);
  z-index: var(--ui-z-dropdown);
  box-sizing: border-box;
  padding: var(--ui-space-1);
  background-color: var(--ui-surface);
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  box-shadow: var(--ui-shadow-pop);
  font-family: inherit;
}

/* ── listbox 滚动区：仅承载选项，长列表滚动（max-height token 推导，随 Select 先例） ── */
.ui-model-selector__listbox {
  max-height: calc(var(--ui-space-8) * 4);
  overflow-y: auto;
}

/* ── 选项：keyboard 高亮 → surface-muted；已选 → accent-soft + accent；
   disabled → text-3 + not-allowed（置于最后优先覆盖） ── */
.ui-model-selector__option {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-xs);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-small);
  color: var(--ui-text-1);
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color var(--ui-motion-fast) var(--ui-ease-out),
    color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-model-selector__option:hover {
  background-color: var(--ui-surface-muted);
}

.ui-model-selector__option--active {
  background-color: var(--ui-surface-muted);
}

.ui-model-selector__option-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ui-model-selector__option[aria-selected='true'] {
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-weight: var(--ui-font-weight-medium);
}

.ui-model-selector__option[aria-disabled='true'],
.ui-model-selector__option[aria-disabled='true']:hover {
  color: var(--ui-text-3);
  cursor: not-allowed;
  background-color: transparent;
}

/* ── 空态 / 加载态：text-3 居中一行 ───────────────────────── */
.ui-model-selector__empty,
.ui-model-selector__loading {
  padding: var(--ui-space-3);
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
  text-align: center;
}
</style>
