<script setup lang="ts">
/**
 * Upload —— 文件上传组件：触发器（点击/拖拽选择）+ 受控文件列表与上传状态。
 *
 * - 受控契约：modelValue 为 UploadFile[] 全量列表；一切变化经
 *   update:modelValue + change 全量发出，使用方以 v-model 回写。
 * - beforeUpload 三态（见 Upload.types.ts）：false 不入列；true/void 直接成功；
 *   Promise 即上传任务（uploading 入列 → resolve 成功 / reject 失败可重试）。
 * - 触发器为原生 button（Enter/Space 平台原生激活），隐藏 file input 由其点击唤起；
 *   drag 模式下 dragover/dragleave/drop 绑定在根容器（整个触发区可放置，事件自
 *   子元素冒泡归一处理，按钮上不再重复绑定避免双触发），高亮反馈仍由根级
 *   ui-upload--dragover 修饰类驱动（落点样式只走既有 token）；
 *   上传中态渲染 token 化进度条（复用 progress 视觉配方），失败项可重试。
 * - 浏览器 API 只出现在事件回调（input.click()、FileList/DataTransfer 解包）；
 *   setup 顶层不访问任何浏览器 API，node 环境 renderToString 无异常。
 * - 一切颜色、字号、间距、圆角、动效均消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref } from 'vue'
import {
  UPLOAD_PROGRESS_ARIA_SUFFIX,
  UPLOAD_REMOVE_ARIA_PREFIX,
  UPLOAD_RETRY_ARIA_PREFIX,
  UPLOAD_STATUS_LABELS,
  UPLOAD_TRIGGER_DRAG_LABEL,
  UPLOAD_TRIGGER_LABEL,
} from './Upload.constants'
import { clampPercent, formatFileSize, useUpload } from './useUpload'
import type { UploadEmits, UploadFile, UploadProps, UploadSlots } from './Upload.types'

const props = withDefaults(defineProps<UploadProps>(), {
  modelValue: () => [],
  accept: undefined,
  multiple: false,
  drag: false,
  maxCount: undefined,
  disabled: false,
  beforeUpload: undefined,
})
const emit = defineEmits<UploadEmits>()
defineSlots<UploadSlots>()

const inputEl = ref<HTMLInputElement | null>(null)

const { files, dragover, chooseFiles, removeFile, retryFile } = useUpload({
  modelValue: () => props.modelValue,
  accept: () => props.accept,
  multiple: () => props.multiple,
  maxCount: () => props.maxCount,
  disabled: () => props.disabled,
  beforeUpload: () => props.beforeUpload,
  onListChange: (list) => {
    emit('update:modelValue', list)
    emit('change', list)
  },
  onRemove: (file) => emit('remove', file),
  onExceed: (batch, list) => emit('exceed', batch, list),
  onError: (error, file) => emit('error', error, file),
})

const classes = computed(() => [
  'ui-upload',
  {
    'ui-upload--drag': props.drag,
    'ui-upload--dragover': props.drag && !props.disabled && dragover.value,
    'ui-upload--disabled': props.disabled,
  },
])

const triggerLabel = computed(() =>
  props.drag ? UPLOAD_TRIGGER_DRAG_LABEL : UPLOAD_TRIGGER_LABEL,
)

/** 点击触发器：唤起隐藏 file input 的原生文件选择对话框（仅客户端事件回调内）。 */
function onTriggerClick(): void {
  if (props.disabled) return
  inputEl.value?.click()
}

/** 选择回调：解包 FileList 后交给 composable；清空 value 以支持重复选择同一文件。 */
function onInputChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const chosen = Array.from(target.files ?? [])
  target.value = ''
  void chooseFiles(chosen)
}

function onDragOver(event: DragEvent): void {
  if (!props.drag || props.disabled) return
  event.preventDefault() // 允许作为放置目标
  dragover.value = true
}

function onDragLeave(): void {
  dragover.value = false
}

function onDrop(event: DragEvent): void {
  if (!props.drag || props.disabled) return
  event.preventDefault()
  dragover.value = false
  const dropped = Array.from(event.dataTransfer?.files ?? [])
  void chooseFiles(dropped)
}

function onRemove(file: UploadFile): void {
  removeFile(file)
}

function onRetry(file: UploadFile): void {
  void retryFile(file)
}

function itemClasses(file: UploadFile): string[] {
  return ['ui-upload__item', `ui-upload__item--${file.status}`]
}

function statusText(file: UploadFile): string {
  if (file.status === 'uploading') {
    return `${UPLOAD_STATUS_LABELS.uploading} ${clampPercent(file.percent)}%`
  }
  return UPLOAD_STATUS_LABELS[file.status]
}

function removeLabel(file: UploadFile): string {
  return `${UPLOAD_REMOVE_ARIA_PREFIX} ${file.name}`
}

function retryLabel(file: UploadFile): string {
  return `${UPLOAD_RETRY_ARIA_PREFIX} ${file.name}`
}

function progressLabel(file: UploadFile): string {
  return `${file.name} ${UPLOAD_PROGRESS_ARIA_SUFFIX}`
}
</script>

<template>
  <div :class="classes" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
    <!-- 隐藏 file input：仅承担原生文件选择对话框；键盘/读屏交互表面是下方触发器 button -->
    <input
      ref="inputEl"
      class="ui-upload__input"
      type="file"
      :accept="accept"
      :multiple="multiple"
      tabindex="-1"
      aria-hidden="true"
      @change="onInputChange"
    >
    <button
      type="button"
      class="ui-upload__trigger"
      :disabled="disabled"
      @click="onTriggerClick"
    >
      <slot name="trigger">
        <svg
          class="ui-upload__trigger-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 15V4m0 0L8 8m4-4l4 4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="ui-upload__trigger-text">{{ triggerLabel }}</span>
      </slot>
    </button>

    <template v-if="files.length > 0">
      <slot name="list" :files="files">
        <ul class="ui-upload__list">
          <li v-for="file in files" :key="file.uid" :class="itemClasses(file)">
            <span class="ui-upload__name">{{ file.name }}</span>
            <span v-if="file.size !== undefined" class="ui-upload__size">{{ formatFileSize(file.size) }}</span>
            <span :class="['ui-upload__status', `ui-upload__status--${file.status}`]">{{ statusText(file) }}</span>
            <button
              v-if="file.status === 'error'"
              type="button"
              class="ui-upload__retry"
              :aria-label="retryLabel(file)"
              :disabled="disabled"
              @click="onRetry(file)"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M21 4v6h-6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M20.5 10a8.5 8.5 0 1 0 .5 3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              class="ui-upload__remove"
              :aria-label="removeLabel(file)"
              :disabled="disabled"
              @click="onRemove(file)"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
              </svg>
            </button>
            <span
              v-if="file.status === 'uploading'"
              class="ui-upload__progress"
              role="progressbar"
              :aria-label="progressLabel(file)"
              :aria-valuenow="clampPercent(file.percent)"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <span
                class="ui-upload__progress-bar"
                :style="{ width: `${clampPercent(file.percent)}%` }"
              />
            </span>
            <span v-if="file.status === 'error' && file.error" class="ui-upload__error-text">{{ file.error }}</span>
          </li>
        </ul>
      </slot>
    </template>
    <slot v-else name="empty" />
  </div>
</template>

<style scoped>
/* ── 根：纵向排布（触发器 + 列表/空态）────────────────────── */
.ui-upload {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  font-family: var(--ui-font-sans);
}

/* ── 隐藏 file input：对辅助技术隐藏、不参与 Tab 序。
   1px/clip 为可达性隐藏的结构性重置（非视觉取值），同社区 visually-hidden 配方 ── */
.ui-upload__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ── 触发器：原生 button（Enter/Space 平台原生激活）；focus 环走全局 :focus-visible ── */
.ui-upload__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-4);
  /* 描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Input 先例在任务结果中提出需求） */
  border-width: 1px;
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-bg);
  color: var(--ui-text-1);
  font: inherit;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
  cursor: pointer;
  transition:
    border-color var(--ui-motion-default) var(--ui-ease-out),
    background-color var(--ui-motion-default) var(--ui-ease-out);
}

.ui-upload__trigger:hover:not(:disabled) {
  border-color: var(--ui-border-strong);
}

.ui-upload__trigger:active:not(:disabled) {
  background-color: var(--ui-surface-muted);
}

.ui-upload__trigger:disabled {
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-3);
  cursor: not-allowed;
}

.ui-upload__trigger-icon {
  flex: none;
  color: var(--ui-text-2);
}

/* ── 拖拽模式：触发器变为虚线拖放区（高度复用 space-8 间距档）── */
.ui-upload--drag .ui-upload__trigger {
  flex-direction: column;
  width: 100%;
  min-height: var(--ui-space-8);
  padding: var(--ui-space-5);
  border-style: dashed;
}

.ui-upload--dragover .ui-upload__trigger {
  border-color: var(--ui-accent);
  background-color: var(--ui-accent-soft);
}

.ui-upload--dragover .ui-upload__trigger-icon,
.ui-upload--dragover .ui-upload__trigger-text {
  color: var(--ui-accent);
}

/* ── 列表：ul/li 原生语义，条目为 surface 卡线 ─────────────── */
.ui-upload__list {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-upload__item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-3);
  border-width: 1px; /* 结构性细线：非视觉取值 */
  border-style: solid;
  border-color: var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-surface);
  font-size: var(--ui-text-sm);
}

.ui-upload__item--error {
  border-color: var(--ui-danger);
}

.ui-upload__name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--ui-text-1);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-upload__size {
  flex: none;
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
  font-variant-numeric: var(--ui-numeric);
}

.ui-upload__status {
  flex: none;
  color: var(--ui-text-2);
  font-size: var(--ui-text-xs);
  font-variant-numeric: var(--ui-numeric);
}

.ui-upload__status--success {
  color: var(--ui-success);
}

.ui-upload__status--error {
  color: var(--ui-danger);
}

/* ── 上传中：进度条复用 progress 视觉配方（muted 轨道 + accent 填充 + xs 端头）──
   占满一整行（flex-basis 100% 在换行容器中另起一行），宽度由 percent 内联驱动 */
.ui-upload__progress {
  flex: 1 1 100%;
  height: var(--ui-space-1);
  overflow: hidden;
  background-color: var(--ui-surface-muted);
  border-radius: var(--ui-radius-xs);
}

.ui-upload__progress-bar {
  height: 100%;
  background-color: var(--ui-accent);
  border-radius: var(--ui-radius-xs);
  transition: width var(--ui-motion-default) var(--ui-ease-out);
}

.ui-upload__error-text {
  flex: 1 1 100%;
  color: var(--ui-danger);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
}

/* ── 行内操作按钮：原生 button，无填充无描边（结构性重置），色相走 token ── */
.ui-upload__retry,
.ui-upload__remove {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  padding: var(--ui-space-1);
  border: none; /* 结构性重置：非视觉取值 */
  border-radius: var(--ui-radius-xs);
  background: transparent; /* 结构性无填充：非色相取值 */
  color: var(--ui-text-3);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-upload__retry {
  color: var(--ui-danger);
}

.ui-upload__retry:hover:not(:disabled) {
  color: var(--ui-text-1);
}

.ui-upload__remove:hover:not(:disabled) {
  color: var(--ui-danger);
}

.ui-upload__retry:disabled,
.ui-upload__remove:disabled {
  cursor: not-allowed;
}
</style>
