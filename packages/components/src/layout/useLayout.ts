/**
 * useLayout —— Layout 家族的共享逻辑收口（headless）。
 *
 * 两块职责：
 *   1. has-sider 推导辅助：Layout 根遍历默认插槽的直接子节点（对 v-if/v-for 产生的
 *      Fragment 层透明下探），静态判断是否包含 LayoutSider —— 在父组件渲染期同步完成，
 *      SSR 单遍渲染即可输出横向布局类，且不受子组件 setup 时序影响、水合稳定；
 *   2. sider 折叠状态机：受控（collapsed）/非受控（defaultCollapsed）解析、
 *      同值去重的 sider-collapse 发射，以及断点接线（matchMedia 只在
 *      客户端挂载后的调用链里访问 —— bindBreakpoint 仅允许由 onMounted 调用）。
 *
 * SSR 安全：模块与 setup 顶层不访问任何浏览器 API。
 */
import { Fragment, computed, ref, toValue, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, VNode } from 'vue'
import { breakpointQuery } from './Layout.constants'
import type { LayoutBreakpoint } from './Layout.types'

/** Fragment 递归下探的深度上限：覆盖 v-if / v-for / template 包裹层即可，防深嵌套开销。 */
const SIDER_SCAN_MAX_DEPTH = 3

/**
 * 判断 vnode 序列中是否包含指定组件（按组件对象引用比对）。
 * 只对 Fragment 透明下探（v-if/v-for 展开后子节点仍是 Layout 的直接 DOM 子节点）；
 * 真实元素包裹（如 div）不视为直接子节点，与 DOM 事实一致。
 */
export function hasVNodeOfType(nodes: readonly VNode[], type: unknown, depth = 0): boolean {
  for (const node of nodes) {
    if (node.type === type) return true
    if (depth < SIDER_SCAN_MAX_DEPTH && node.type === Fragment && Array.isArray(node.children)) {
      if (hasVNodeOfType(node.children as VNode[], type, depth + 1)) return true
    }
  }
  return false
}

/** LayoutSider 折叠状态机的公开面。 */
export interface LayoutSiderCollapse {
  /** 当前生效折叠态（受控优先，非受控回落内部状态）。 */
  collapsed: ComputedRef<boolean>
  /** 设置折叠态：同值不动作；受控只发 sider-collapse，非受控同时写内部状态。 */
  setCollapsed: (next: boolean) => void
  /** 翻转折叠态（折叠触发器点击）。 */
  toggle: () => void
  /**
   * 断点响应式接线：立即按当前视口对齐折叠态，并监听跨越事件。
   * 访问 window.matchMedia —— 只允许在 onMounted（或其调用链）中调用；
   * 返回清理函数（停 watch + 解除媒体查询监听），供 onBeforeUnmount 执行。
   */
  bindBreakpoint: (getBreakpoint: () => LayoutBreakpoint | undefined) => () => void
}

/** useLayoutSiderCollapse 选项。 */
export interface UseLayoutSiderCollapseOptions {
  /** 受控 collapsed 来源（props.collapsed；undefined 表示非受控）。 */
  collapsed: MaybeRefOrGetter<boolean | undefined>
  /** 非受控初始值（仅初始化时读取一次）。 */
  defaultCollapsed: MaybeRefOrGetter<boolean>
  /** sider-collapse 发射器。 */
  emit: (collapsed: boolean) => void
}

/** LayoutSider 折叠状态机。 */
export function useLayoutSiderCollapse(options: UseLayoutSiderCollapseOptions): LayoutSiderCollapse {
  const innerCollapsed = ref(toValue(options.defaultCollapsed))
  const isControlled = computed(() => toValue(options.collapsed) !== undefined)
  const collapsed = computed(() => toValue(options.collapsed) ?? innerCollapsed.value)

  function setCollapsed(next: boolean): void {
    if (collapsed.value === next) return
    if (!isControlled.value) innerCollapsed.value = next
    options.emit(next)
  }

  function toggle(): void {
    setCollapsed(!collapsed.value)
  }

  function bindBreakpoint(getBreakpoint: () => LayoutBreakpoint | undefined): () => void {
    let teardownMedia: (() => void) | null = null

    // 视口对齐语义：低于断点 → 折叠；回到断点以上 → 展开（同值自动去重不发射）。
    const applyViewport = (matches: boolean): void => {
      setCollapsed(matches)
    }

    const rebuild = (): void => {
      teardownMedia?.()
      teardownMedia = null
      const breakpoint = getBreakpoint()
      if (breakpoint === undefined) return
      const media = window.matchMedia(breakpointQuery(breakpoint))
      const onChange = (event: MediaQueryListEvent): void => {
        applyViewport(event.matches)
      }
      media.addEventListener('change', onChange)
      teardownMedia = () => {
        media.removeEventListener('change', onChange)
      }
      // 接线即对齐：挂载时视口已在断点以下 → 立即折叠（经 setCollapsed 去重后发射）。
      applyViewport(media.matches)
    }

    rebuild()
    // 断点 prop 变更后重接线；watch 在 onMounted 调用链内创建，随组件实例自动销毁。
    const stopWatch = watch(getBreakpoint, rebuild)

    return () => {
      stopWatch()
      teardownMedia?.()
      teardownMedia = null
    }
  }

  return { collapsed, setCollapsed, toggle, bindBreakpoint }
}
