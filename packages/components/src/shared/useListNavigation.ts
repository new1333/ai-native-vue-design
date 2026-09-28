/**
 * useListNavigation —— 下拉列表高亮导航状态机共享 composable（headless，无 DOM）。
 *
 * 收口 select / autocomplete / cascader / tree-select / model-selector 家族的
 * 高亮下标数学（WAI-ARIA listbox 导航纪律）：
 *   1. 高亮只在可选集合（enabledIndexes，各组件按自身禁用/加载闸门过滤）内移动；
 *   2. moveActive：逐项移动跳过不可选项，两端夹住（不环绕）；
 *   3. toEdge：跳到首个/末个可选项；
 *   4. initialActiveIndex：打开落位——已选下标（若仍在可选集合内）优先，
 *      否则 edge 端首个可选项；集合为空返回 -1；
 *   5. setActive：唯一落位点，onActiveIndexChange 通知（如高亮项滚动跟随）。
 *
 * 各组件的键盘状态机（Enter/Space 选中、Esc 关闭、家族特有键）仍留在自身
 * composable——那是真正的差异点；本模块只持有无差异的下标数学。
 *
 * SSR 安全：不访问任何浏览器 API。
 */
import { ref } from 'vue'
import type { Ref } from 'vue'

/** 高亮导航的方向/边缘。 */
export type ListNavigationEdge = 'first' | 'last'

/** useListNavigation 选项。 */
export interface UseListNavigationOptions {
  /** 可选下标全集（响应式 getter；各组件按禁用/加载闸门过滤后传入）。 */
  enabledIndexes: () => number[]
  /** 已选下标来源（未选/未命中传 -1）——打开落位时优先。 */
  selectedIndex: () => number
  /** 引擎路径设置高亮后的通知（如高亮项滚动跟随）。 */
  onActiveIndexChange?: (index: number) => void
}

/** useListNavigation 返回值。 */
export interface UseListNavigationReturn {
  /** 当前高亮下标（-1 = 无高亮；关闭时由调用方复位）。 */
  activeIndex: Ref<number>
  /** 唯一落位点（同时触发 onActiveIndexChange）。 */
  setActive: (index: number) => void
  /** 打开落位下标：已选（若仍可选）优先，否则 edge 端首个可选；集合为空 -1。 */
  initialActiveIndex: (edge: ListNavigationEdge) => number
  /** 高亮移动 step 步：跳过不可选项，在可选集合两端夹住（不环绕）。 */
  moveActive: (step: 1 | -1) => void
  /** 高亮跳到首个/末个可选项。 */
  toEdge: (edge: ListNavigationEdge) => void
}

/** 下拉列表高亮导航状态机（纯逻辑，无 DOM）。 */
export function useListNavigation(options: UseListNavigationOptions): UseListNavigationReturn {
  const activeIndex = ref(-1)

  /** 唯一落位点：集中触发 onActiveIndexChange（滚动跟随等副作用挂这里）。 */
  function setActive(index: number): void {
    activeIndex.value = index
    options.onActiveIndexChange?.(index)
  }

  /** 打开落位：已选下标（若仍在可选集合内）优先，否则 edge 端首个可选项。 */
  function initialActiveIndex(edge: ListNavigationEdge): number {
    const selected = options.selectedIndex()
    if (selected >= 0 && options.enabledIndexes().includes(selected)) return selected
    const enabled = options.enabledIndexes()
    if (enabled.length === 0) return -1
    return edge === 'first' ? enabled[0] : enabled[enabled.length - 1]
  }

  /** 逐项移动：当前不在可选集合内时按方向取端点，否则步进并在两端夹住（不环绕）。 */
  function moveActive(step: 1 | -1): void {
    const enabled = options.enabledIndexes()
    if (enabled.length === 0) return
    const current = enabled.indexOf(activeIndex.value)
    const next =
      current === -1
        ? step === 1
          ? 0
          : enabled.length - 1
        : Math.min(Math.max(current + step, 0), enabled.length - 1)
    setActive(enabled[next])
  }

  /** 边缘跳转：首个/末个可选项。 */
  function toEdge(edge: ListNavigationEdge): void {
    const enabled = options.enabledIndexes()
    if (enabled.length === 0) return
    setActive(edge === 'first' ? enabled[0] : enabled[enabled.length - 1])
  }

  return { activeIndex, setActive, initialActiveIndex, moveActive, toEdge }
}
