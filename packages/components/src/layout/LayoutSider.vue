<script setup lang="ts">
/**
 * LayoutSider —— 页面骨架侧栏区块：语义 <aside>，可折叠（触发器原生 button +
 * aria-expanded/aria-controls）与响应式断点（matchMedia 仅在 onMounted 接线，
 * onBeforeUnmount 清理）。折叠态受控（collapsed）/非受控（defaultCollapsed），
 * 变化统一发出 sider-collapse（同值去重）。
 */
import { computed, onBeforeUnmount, onMounted, useId } from 'vue'
import { LAYOUT_SIDER_DEFAULT_COLLAPSED } from './Layout.constants'
import { useLayoutSiderCollapse } from './useLayout'
import type { LayoutSiderEmits, LayoutSiderProps, LayoutSiderSlots } from './Layout.types'

const props = withDefaults(defineProps<LayoutSiderProps>(), {
  collapsible: false,
  breakpoint: undefined,
  collapsed: undefined,
  defaultCollapsed: LAYOUT_SIDER_DEFAULT_COLLAPSED,
})
const emit = defineEmits<LayoutSiderEmits>()
defineSlots<LayoutSiderSlots>()

// aside 元素 id：触发器 aria-controls 的指向目标（实例级唯一，SSR 稳定）。
const siderId = `ui-layout-sider-${useId()}`

const collapse = useLayoutSiderCollapse({
  collapsed: () => props.collapsed,
  defaultCollapsed: () => props.defaultCollapsed,
  emit: (next) => emit('sider-collapse', next),
})

let stopBreakpoint: (() => void) | null = null

onMounted(() => {
  // 断点接线（window.matchMedia）只能在客户端挂载后进行：SSR 纪律（浏览器 API 仅 onMounted）。
  stopBreakpoint = collapse.bindBreakpoint(() => props.breakpoint)
})

onBeforeUnmount(() => {
  stopBreakpoint?.()
  stopBreakpoint = null
})

// 顶层 ref 绑定：模板中嵌套在普通对象内的 ref 不会自动解包，必须先提到顶层。
const isCollapsed = collapse.collapsed

const classes = computed(() => [
  'ui-layout__sider',
  { 'ui-layout__sider--collapsed': isCollapsed.value },
])
</script>

<template>
  <aside :id="siderId" :class="classes">
    <div class="ui-layout__sider-body">
      <slot />
    </div>
    <button
      v-if="props.collapsible"
      type="button"
      class="ui-layout__sider-trigger"
      :aria-controls="siderId"
      :aria-expanded="isCollapsed ? 'false' : 'true'"
      aria-label="切换侧栏"
      @click="collapse.toggle()"
    >
      <!-- 折叠方向指示：展开时朝左（收起），折叠时旋转 180°（朝右展开） -->
      <svg
        class="ui-layout__sider-trigger-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m11 17-5-5 5-5" />
        <path d="m18 17-5-5 5-5" />
      </svg>
    </button>
  </aside>
</template>

<style scoped>
/* ── 侧栏：surface 面；展开宽 256px 由间距标尺推导（calc(--ui-space-8 × 4)，
      无 sider 宽度 token，随 Dialog/Drawer 先例在任务结果中提出需求）────────── */
.ui-layout__sider {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: calc(var(--ui-space-8) * 4);
  overflow: hidden;
  background-color: var(--ui-surface);
  /* 分隔线 1px 为结构性细线（无 --ui-border-width token，随 Card/Tabs 先例在任务结果中提出需求） */
  border-right: 1px solid var(--ui-border);
  transition: width var(--ui-motion-default) var(--ui-ease-out);
}

/* ── 折叠档：收窄为 64px 导航轨（--ui-space-8），溢出裁剪 ────────────────── */
.ui-layout__sider--collapsed {
  width: var(--ui-space-8);
}

.ui-layout__sider-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  color: var(--ui-text-1);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-body);
}

/* ── 折叠触发器：原生 button，置于侧栏底部；焦点环交给全局 :focus-visible 约定 ── */
.ui-layout__sider-trigger {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: auto;
  padding: var(--ui-space-2);
  border: none;
  background-color: transparent;
  color: var(--ui-text-2);
  cursor: pointer;
  transition: color var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-layout__sider-trigger:hover {
  color: var(--ui-text-1);
}

.ui-layout__sider-trigger-icon {
  width: 16px;
  height: 16px;
  transition: transform var(--ui-motion-default) var(--ui-ease-out);
}

.ui-layout__sider--collapsed .ui-layout__sider-trigger-icon {
  transform: rotate(180deg);
}
</style>
