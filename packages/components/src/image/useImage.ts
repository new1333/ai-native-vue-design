/**
 * useImage —— Image 的状态机 composable：loading/loaded/error 流转、
 * lazy 懒加载（IntersectionObserver）与大图预览开关（焦点移入/回归、Esc 关闭、Tab 圈定）。
 *
 * SSR 安全：模块顶层不访问任何浏览器 API；IntersectionObserver 只在
 * 由 onMounted 调用的 startLazyObserver 中创建、由 onBeforeUnmount 调用的
 * stopLazyObserver 中销毁；document 只出现在由用户事件（点击 / 键盘）调用的
 * 预览开关函数内部（仓库先例：dialog/useDialog 的 SSR 纪律注释）。
 */
import { computed, nextTick, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import {
  IMAGE_ESCAPE_KEY,
  IMAGE_PREVIEW_FOCUSABLE_SELECTOR,
  IMAGE_STATUS_ERROR,
  IMAGE_STATUS_LOADED,
  IMAGE_STATUS_LOADING,
  IMAGE_TAB_KEY,
} from './Image.constants'
import type { ImageProps, ImageStatus } from './Image.types'

/** useImage 选项。 */
export interface UseImageOptions {
  /** 响应式 props（setup 的 withDefaults 结果）。 */
  props: ImageProps
  /** 根元素引用（lazy 的观察目标）。 */
  rootRef: Ref<HTMLElement | null>
  /** 预览浮层面板引用（焦点移入目标；模板 ref 由 SFC 持有）。 */
  previewPanelRef: Ref<HTMLElement | null>
  /** 实际展示的图片（含 fallback 回落）加载成功回调（SFC 内转发 emit('load')）。 */
  onLoad?: (event: Event) => void
  /** 任一次实际加载尝试失败回调（SFC 内转发 emit('error')）。 */
  onError?: (event: Event) => void
}

/** useImage 返回值。 */
export interface UseImageReturn {
  /** 当前状态。 */
  status: Ref<ImageStatus>
  /** lazy 门闩：true 时才渲染 img 并发起请求。 */
  shouldLoad: Ref<boolean>
  /** 实际请求的图片地址（主源或 fallback）。 */
  currentSrc: Ref<string>
  /** img 是否在 DOM（lazy 未触发 / error 终态 / 空 src 时不渲染）。 */
  imgVisible: ComputedRef<boolean>
  /** 预览浮层开关。 */
  previewOpen: Ref<boolean>
  /** 懒加载观察：仅在 onMounted 调用。 */
  startLazyObserver: () => void
  /** 懒观察销毁：仅在 onBeforeUnmount 调用（触发后/重复调用幂等）。 */
  stopLazyObserver: () => void
  /** 绑定 img @load。 */
  onImgLoad: (event: Event) => void
  /** 绑定 img @error。 */
  onImgError: (event: Event) => void
  /** 打开预览（仅 preview 且 loaded 时生效）。 */
  openPreview: () => void
  /** 关闭预览并还原焦点（幂等）。 */
  closePreview: () => void
  /** 绑定预览浮层 @keydown：Esc 关闭、Tab 圈定。 */
  onPreviewKeydown: (event: KeyboardEvent) => void
  /** 绑定预览浮层 @click：仅点击遮罩本体（target === currentTarget）时关闭。 */
  onPreviewBackdropClick: (event: MouseEvent) => void
}

/** useImage —— Image 状态机 composable。 */
export function useImage(options: UseImageOptions): UseImageReturn {
  const { props, rootRef, previewPanelRef } = options

  /** 状态机：空 src 直接落 error（无事可加载）。 */
  const status = ref<ImageStatus>(props.src ? IMAGE_STATUS_LOADING : IMAGE_STATUS_ERROR)
  /** 实际请求地址：主源，失败后可能切换为 fallback。 */
  const currentSrc = ref(props.src)
  /** lazy 门闩：非 lazy 直接放行；lazy 初始为 false，等待进入视口。 */
  const shouldLoad = ref(props.lazy !== true)

  /**
   * src 变化：重置状态机重新加载；预览中内容已变更，先关闭浮层并还原焦点。
   * lazy 且尚未进入视口时保持门闩关闭（观察器仍在，进入视口后加载新 src）。
   */
  watch(
    () => props.src,
    (src) => {
      currentSrc.value = src
      status.value = src ? IMAGE_STATUS_LOADING : IMAGE_STATUS_ERROR
      if (previewOpen.value) closePreview()
    },
  )

  /** 懒加载观察器（仅客户端、仅 mounted 生命周期内存在）。 */
  let lazyObserver: IntersectionObserver | null = null

  /** 断开懒观察（幂等）。 */
  function stopLazyObserver(): void {
    if (lazyObserver === null) return
    lazyObserver.disconnect()
    lazyObserver = null
  }

  /**
   * 创建懒观察（仅由 onMounted 调用）：观察根元素，首次进入视口即放行 shouldLoad
   * 并断开观察。环境无 IntersectionObserver 时降级为立即加载。
   */
  function startLazyObserver(): void {
    if (props.lazy !== true || shouldLoad.value) return
    if (typeof IntersectionObserver === 'undefined') {
      shouldLoad.value = true
      return
    }
    stopLazyObserver()
    lazyObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        stopLazyObserver()
        shouldLoad.value = true
      }
    })
    if (rootRef.value !== null) lazyObserver.observe(rootRef.value)
  }

  /** img 是否在 DOM：lazy 门闩放行、非终态 error 且有可用地址。 */
  const imgVisible = computed(
    () => shouldLoad.value && status.value !== IMAGE_STATUS_ERROR && currentSrc.value !== '',
  )

  /** 展示图加载成功（含 fallback 回落成功）：落 loaded 并转发 load。 */
  function onImgLoad(event: Event): void {
    status.value = IMAGE_STATUS_LOADED
    options.onLoad?.(event)
  }

  /**
   * 加载尝试失败：转发 error；配置了 fallback 且尚未回落过时切换到 fallback
   * 继续保持 loading；否则落 error 终态。
   */
  function onImgError(event: Event): void {
    options.onError?.(event)
    const fallback = props.fallback
    if (fallback && currentSrc.value !== fallback) {
      currentSrc.value = fallback
      return
    }
    status.value = IMAGE_STATUS_ERROR
  }

  /* ── 大图预览：开关与焦点管理 ─────────────────────────── */

  const previewOpen = ref(false)

  /** 打开前的焦点元素（关闭时还原）。 */
  let previouslyFocused: HTMLElement | null = null

  /** 打开预览：记录当前焦点，渲染就绪后把焦点移入浮层面板。 */
  function openPreview(): void {
    if (props.preview !== true || status.value !== IMAGE_STATUS_LOADED || previewOpen.value) return
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    previewOpen.value = true
    void nextTick(() => {
      if (previewOpen.value) previewPanelRef.value?.focus()
    })
  }

  /** 关闭预览并还原焦点（幂等；焦点元素已脱离文档时仅关闭）。 */
  function closePreview(): void {
    if (!previewOpen.value) return
    previewOpen.value = false
    const toRestore = previouslyFocused
    previouslyFocused = null
    if (toRestore !== null && toRestore.isConnected) toRestore.focus()
  }

  /** 预览内 Tab 圈定：焦点在浮层内可聚焦元素间首尾环绕，不逃逸。 */
  function trapPreviewTab(event: KeyboardEvent): void {
    const panel = previewPanelRef.value
    if (panel === null) return
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(IMAGE_PREVIEW_FOCUSABLE_SELECTOR),
    ).filter((element) => !element.hasAttribute('disabled'))
    if (focusables.length === 0) {
      event.preventDefault()
      panel.focus()
      return
    }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement
    if (!(active instanceof Node) || !panel.contains(active)) {
      event.preventDefault()
      first.focus()
      return
    }
    if (active === last && !event.shiftKey) {
      event.preventDefault()
      first.focus()
    } else if (active === first && event.shiftKey) {
      event.preventDefault()
      last.focus()
    }
  }

  /** 预览浮层键盘路径：Esc 请求关闭；Tab 圈定焦点。 */
  function onPreviewKeydown(event: KeyboardEvent): void {
    if (event.key === IMAGE_ESCAPE_KEY) {
      event.preventDefault()
      closePreview()
      return
    }
    if (event.key === IMAGE_TAB_KEY) trapPreviewTab(event)
  }

  /** 仅点击遮罩本体（而非内部图片/按钮）时关闭。 */
  function onPreviewBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) closePreview()
  }

  return {
    status,
    shouldLoad,
    currentSrc,
    imgVisible,
    previewOpen,
    startLazyObserver,
    stopLazyObserver,
    onImgLoad,
    onImgError,
    openPreview,
    closePreview,
    onPreviewKeydown,
    onPreviewBackdropClick,
  }
}
