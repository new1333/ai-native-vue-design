<script setup lang="ts">
/**
 * Splitter —— 可拖拽分割面板：多 pane 布局根组件。
 *
 * - 默认插槽内放若干 SplitterPane 直接子组件（决定面板数量与内容）；
 *   面板约束（min/max/collapsible/label）经 panes 属性按面板顺序声明。
 * - 面板间渲染分隔条：role="separator" + aria-orientation + aria-value*，
 *   指针拖拽与键盘（←→ / ↑↓ / Home / End / Enter）双路径，逻辑收口于 useSplitter。
 * - 尺寸模型为百分比数组（modelValue 可选受控）；分隔条 aria-controls 指向
 *   主面板（useId 生成，SSR/客户端一致）。
 * - 一切颜色、字号、间距、动效均消费 var(--ui-*) token（paper.css）；
 *   1px 结构线与 100% 结构尺寸随 Button/Input/Divider 先例。
 */
import { computed, defineComponent, isVNode, ref, useId, useSlots } from 'vue'
import type { PropType, VNode } from 'vue'
import SplitterPane from './SplitterPane.vue'
import {
  SPLITTER_COLLAPSIBLE_DEFAULT,
  SPLITTER_DIRECTION_DEFAULT,
  SPLITTER_HANDLE_LABEL_DEFAULT,
  SPLITTER_MAX_DEFAULT,
  SPLITTER_MIN_DEFAULT,
  SPLITTER_PERCENT_PRECISION,
} from './Splitter.constants'
import { useSplitter } from './useSplitter'
import type { SplitterEmits, SplitterPaneSpec, SplitterProps, SplitterSlots } from './Splitter.types'

const props = withDefaults(defineProps<SplitterProps>(), {
  direction: SPLITTER_DIRECTION_DEFAULT,
})
const emit = defineEmits<SplitterEmits>()
defineSlots<SplitterSlots>()

const slots = useSlots()
const rootEl = ref<HTMLElement | null>(null)
const uid = useId()

/**
 * 内部转发组件：模板无法直接渲染插槽取出的 SplitterPane vnode，
 * 以渲染函数载体输出（每次 Splitter 渲染取到全新 vnode，实例按 key 原地复用）。
 */
const VnodeOutlet = defineComponent({
  name: 'UiSplitterVnodeOutlet',
  props: {
    vnode: { type: Object as PropType<VNode>, required: true },
  },
  setup: (outletProps) => () => outletProps.vnode,
})

/** 从默认插槽取出 SplitterPane vnode 序列（其余子节点不参与布局）。仅渲染期调用。 */
function collectPanes(): VNode[] {
  return (slots.default?.() ?? []).filter(
    (node): node is VNode => isVNode(node) && node.type === SplitterPane,
  )
}

/**
 * 生效面板约束：由 panes prop 归一（缺省 min 0 / max 100 / collapsible false）。
 * 刻意不读插槽 vnode 的 props——约束要在拖拽/键盘事件回调（渲染期之外）参与
 * 求解，渲染期外调用插槽函数不在 Vue 契约内（dev 会警告依赖不被追踪）。
 */
const specs = computed<SplitterPaneSpec[]>(() =>
  (props.panes ?? []).map((option) => ({
    min: option.min ?? SPLITTER_MIN_DEFAULT,
    max: option.max ?? SPLITTER_MAX_DEFAULT,
    collapsible: option.collapsible ?? SPLITTER_COLLAPSIBLE_DEFAULT,
    label: option.label,
  })),
)

const splitter = useSplitter({
  direction: () => props.direction,
  specs: () => specs.value,
  modelValue: () => props.modelValue,
  getRoot: () => rootEl.value,
  onChange: (sizes) => {
    emit('update:modelValue', sizes)
    emit('resize', sizes)
  },
  onCollapse: (payload) => emit('collapse', payload),
})

// ── 渲染期求值（Divider 先例：函数式而非 computed，保证插槽显隐即时同步）──

interface SplitterCellPane {
  kind: 'pane'
  index: number
  key: string | number | symbol
  vnode: VNode
}
interface SplitterCellHandle {
  kind: 'handle'
  index: number
  key: string
  aria: ReturnType<typeof splitter.handleAria>
  label: string
}
type SplitterCell = SplitterCellPane | SplitterCellHandle

/**
 * 面板 vnode 与分隔条交错成布局单元序列（每轮渲染求值，key 优先沿用使用方声明的 key）。
 * 先同步面板数量（仅数量变化时写入，恰好多渲染一轮后收敛），再产出单元：
 * 同一渲染轮次内尺寸即时正确，SSR 首屏即均分/受控值。
 */
function cells(): SplitterCell[] {
  const panes = collectPanes()
  splitter.syncPaneCount(panes.length)
  const list: SplitterCell[] = []
  panes.forEach((vnode, index) => {
    list.push({
      kind: 'pane',
      index,
      key: (vnode.key ?? `ui-splitter-pane-${index}`) as string | number | symbol,
      vnode,
    })
    if (index < panes.length - 1) {
      list.push({
        kind: 'handle',
        index,
        key: `ui-splitter-handle-${index}`,
        aria: splitter.handleAria(index),
        label: specs.value[index]?.label ?? SPLITTER_HANDLE_LABEL_DEFAULT,
      })
    }
  })
  return list
}

const rootClasses = computed(() => [
  'ui-splitter',
  `ui-splitter--${props.direction}`,
  { 'ui-splitter--dragging': splitter.draggingHandle.value !== null },
])

/** 分隔条主面板的 id（aria-controls 用；useId 保证 SSR/客户端一致）。 */
function paneId(index: number): string {
  return `ui-splitter-pane-${uid}-${index}`
}

function paneClasses(index: number): Record<string, boolean> {
  return {
    'ui-splitter__pane': true,
    'ui-splitter__pane--collapsed': splitter.isCollapsed(index),
  }
}

/** flex-basis 百分比（折叠面板尺寸为 0，配合 --collapsed 修饰类隐藏）。 */
function paneStyle(index: number): Record<string, string> {
  const size = splitter.sizes.value[index] ?? 0
  return { flexBasis: `${Number(size.toFixed(SPLITTER_PERCENT_PRECISION))}%` }
}

/** 分隔条方向与分割方向互补：horizontal 分栏 → 竖向分隔条（aria-orientation=vertical）。 */
const handleOrientation = computed(() =>
  props.direction === 'vertical' ? 'horizontal' : 'vertical',
)

function handleClasses(cell: SplitterCellHandle): Record<string, boolean> {
  return {
    'ui-splitter__handle': true,
    'ui-splitter__handle--active': splitter.draggingHandle.value === cell.index,
  }
}
</script>

<template>
  <div ref="rootEl" :class="rootClasses">
    <template v-for="cell in cells()" :key="cell.key">
      <div
        v-if="cell.kind === 'pane'"
        :id="paneId(cell.index)"
        :class="paneClasses(cell.index)"
        :style="paneStyle(cell.index)"
      >
        <VnodeOutlet :vnode="cell.vnode" />
      </div>
      <div
        v-else
        :class="handleClasses(cell)"
        role="separator"
        :aria-orientation="handleOrientation"
        tabindex="0"
        :aria-label="cell.label"
        :aria-controls="paneId(cell.index)"
        :aria-valuenow="cell.aria['aria-valuenow']"
        :aria-valuemin="cell.aria['aria-valuemin']"
        :aria-valuemax="cell.aria['aria-valuemax']"
        :aria-valuetext="cell.aria['aria-valuetext']"
        @pointerdown="splitter.onHandlePointerDown(cell.index, $event)"
        @keydown="splitter.onHandleKeydown(cell.index, $event)"
      >
        <span class="ui-splitter__handle-line" aria-hidden="true"></span>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── 基底：占满父容器的 flex 布局（结构尺寸为结构性取值）───────── */
.ui-splitter {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100%;
  color: var(--ui-text-1);
  font-family: var(--ui-font-sans);
}

.ui-splitter--horizontal {
  flex-direction: row;
}

.ui-splitter--vertical {
  flex-direction: column;
}

/* ── 拖拽中：禁用文本选择，并关闭尺寸过渡保证跟手 ─────────────── */
.ui-splitter--dragging {
  user-select: none;
}

/* ── 面板区域：尺寸由 flex-basis 驱动，可被压缩到内容以下 ──────── */
.ui-splitter__pane {
  box-sizing: border-box;
  flex: 0 0 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  transition: flex-basis var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-splitter--dragging .ui-splitter__pane {
  transition: none;
}

/* 折叠：尺寸 0 + 隐藏（内容保留在 DOM，SSR 可输出） */
.ui-splitter__pane--collapsed {
  display: none;
}

/* ── 分隔条：token 命中区 + 居中结构线（1px 结构线随 Button/Input/Divider 先例）── */
.ui-splitter__handle {
  box-sizing: border-box;
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  background-color: transparent;
}

.ui-splitter--horizontal .ui-splitter__handle {
  width: var(--ui-space-2);
  cursor: col-resize;
}

.ui-splitter--vertical .ui-splitter__handle {
  height: var(--ui-space-2);
  cursor: row-resize;
}

.ui-splitter__handle-line {
  background-color: var(--ui-border);
  transition: background-color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-splitter--horizontal .ui-splitter__handle-line {
  width: 1px;
  height: 100%;
}

.ui-splitter--vertical .ui-splitter__handle-line {
  width: 100%;
  height: 1px;
}

.ui-splitter__handle:hover .ui-splitter__handle-line {
  background-color: var(--ui-border-strong);
}

/* 拖拽中的分隔条与按压态：强调色提示当前拖拽对象 */
.ui-splitter__handle:active .ui-splitter__handle-line,
.ui-splitter__handle--active .ui-splitter__handle-line {
  background-color: var(--ui-accent);
}
</style>
