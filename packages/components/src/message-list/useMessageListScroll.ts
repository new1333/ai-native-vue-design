/**
 * useMessageListScroll —— MessageList 的滚动状态机 composable（headless）。
 *
 * 收口三类语义：
 *   1. 判定：贴底 = 视口底边距内容底部的距离（scrollHeight - scrollTop - clientHeight）
 *      ≤ nearBottomThreshold；顶部触发区 = scrollTop ≤ MESSAGE_LIST_LOAD_MORE_THRESHOLD。
 *   2. 播报：挂载首帧（attach）播报一次初始贴底状态；此后仅状态翻转时回调
 *      onNearBottomChange。loadMore 为一次性边沿触发：进入顶部触发区发一次，
 *      离开后重新武装，滞留区内不重复发出。
 *   3. 跟随：autoScroll 且当前贴底时定位到底部——挂载首帧（attach）与内容更新后
 *      （followIfNear，由组件 onUpdated 调用）各有一次机会；scrollToBottom 供外部随时调用。
 *
 * SSR 安全：本文件不在模块顶层 / setup 顶层访问任何浏览器 API；所有布局读取都发生在
 * attach（onMounted 调用）、handleScroll（mounted 后绑定的监听器）、followIfNear
 * （onUpdated，客户端专属生命周期）或 scrollToBottom 的调用链内。
 */
import { ref, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'
import {
  MESSAGE_LIST_LOAD_MORE_THRESHOLD,
  MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT,
} from './MessageList.constants'

/** useMessageListScroll 选项。 */
export interface UseMessageListScrollOptions {
  /** 滚动容器 ref（由组件创建并绑定到根元素；composable 只读写其 value）。 */
  rootRef: Ref<HTMLElement | null>
  /** 贴底自动滚动开关（响应式来源）。 */
  autoScroll: MaybeRefOrGetter<boolean>
  /** 贴底判定阈值（响应式来源；未提供时回落 MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT）。 */
  nearBottomThreshold?: MaybeRefOrGetter<number | undefined>
  /** 贴底状态回调（挂载首帧播报 + 状态翻转时），用于发出 nearBottom 事件。 */
  onNearBottomChange: (value: boolean) => void
  /** 进入顶部触发区回调（一次性边沿），用于发出 loadMore 事件。 */
  onLoadMore: () => void
  /** 原生 scroll 事件透传回调，用于发出 scroll 事件。 */
  onScroll: (event: Event) => void
}

/** useMessageListScroll 返回值。 */
export interface UseMessageListScrollReturn {
  /** 当前是否贴底（初始假定贴底；attach 实测校正）。 */
  nearBottom: Ref<boolean>
  /** 挂载绑定：绑定 scroll 监听（passive）→ autoScroll 时定位到底部 → 播报初始贴底状态。 */
  attach: () => void
  /** 卸载清理：移除 scroll 监听。 */
  detach: () => void
  /** scroll 监听器：更新贴底状态（翻转才回调）+ loadMore 边沿 + 透传原生事件。 */
  handleScroll: (event: Event) => void
  /** 立即定位到底部（scrollTop = scrollHeight，即时赋值，不做平滑动画）。 */
  scrollToBottom: () => void
  /** 内容更新后的跟随入口：autoScroll 且当前贴底时才滚动（由组件 onUpdated 调用）。 */
  followIfNear: () => void
}

/** useMessageListScroll 滚动状态机 composable。 */
export function useMessageListScroll(options: UseMessageListScrollOptions): UseMessageListScrollReturn {
  const { rootRef } = options
  /** 初始假定贴底：新会话从最新消息开始；attach 首帧实测校正并播报。 */
  const nearBottom = ref(true)
  /** 是否滞留在顶部触发区（loadMore 边沿武装标记）。 */
  let inTopZone = false

  /** 视口底边距内容底部的距离（px）。 */
  function distanceToBottom(el: HTMLElement): number {
    return el.scrollHeight - el.scrollTop - el.clientHeight
  }

  /** 贴底判定。 */
  function isNearBottom(el: HTMLElement): boolean {
    const threshold = toValue(options.nearBottomThreshold) ?? MESSAGE_LIST_NEAR_BOTTOM_THRESHOLD_DEFAULT
    return distanceToBottom(el) <= threshold
  }

  function scrollToBottom(): void {
    const el = rootRef.value
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  function followIfNear(): void {
    if (!toValue(options.autoScroll)) return
    if (!nearBottom.value) return
    scrollToBottom()
  }

  function handleScroll(event: Event): void {
    const el = rootRef.value
    if (!el) return
    // 贴底状态：翻转才回调（进入/离开贴底区各播报一次）。
    const measured = isNearBottom(el)
    if (measured !== nearBottom.value) {
      nearBottom.value = measured
      options.onNearBottomChange(measured)
    }
    // loadMore：进入顶部触发区发一次；离开后重新武装，滞留区内不重复发。
    const top = el.scrollTop <= MESSAGE_LIST_LOAD_MORE_THRESHOLD
    if (top && !inTopZone) options.onLoadMore()
    inTopZone = top
    options.onScroll(event)
  }

  function attach(): void {
    const el = rootRef.value
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    // 挂载首帧：autoScroll 时先定位到底部（会话从最新消息开始），再实测播报初始贴底状态。
    if (toValue(options.autoScroll)) scrollToBottom()
    const measured = isNearBottom(el)
    nearBottom.value = measured
    options.onNearBottomChange(measured)
  }

  function detach(): void {
    rootRef.value?.removeEventListener('scroll', handleScroll)
  }

  return { nearBottom, attach, detach, handleScroll, scrollToBottom, followIfNear }
}
