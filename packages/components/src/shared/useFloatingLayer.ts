/**
 * useFloatingLayer —— 浮层引擎共享 composable：按锚点元素定位浮层，收口全库
 * 两族手写定位策略与「关闭信号」监听（点击外部 / Esc）。
 *
 *   1. anchored 策略（tooltip / popover / hover-card / popconfirm 家族）：
 *      满屏 fixed 层内按锚点 rect 的视口坐标四向定位（top / bottom / left /
 *      right），间距在 calc 内引用 gap token，居中/贴边用结构性 translate
 *      百分比，无需测量浮层自身尺寸；可选滚动（capture）/ resize 跟随重排
 *      （popover 家族跟随，tooltip 不跟随）；
 *   2. dropdown 策略（select / autocomplete / cascader / tree-select /
 *      date-picker / model-selector 家族）：弹层 Teleport 到 body 下绝对定位，
 *      包含块是初始包含块（文档原点），须按 window.scrollX/scrollY 把锚点
 *      rect 视口坐标换算为文档坐标；打开期间弹层与文档同滚，无需滚动监听跟随；
 *      minWidth 对齐锚点宽度；
 *   3. 关闭信号：closeOnOutsideClick 时在 document（capture）监听点击，目标
 *      落在 insideElements 任一元素内则放行，否则 onRequestClose('outside')；
 *      onKeydown 在打开状态收到 Esc 时 preventDefault 并
 *      onRequestClose('escape')（下拉家族的 Esc 在各自键盘状态机内受理，可关）。
 *
 * 打开与打开期间方向变化：等 Teleport 内容落地后（nextTick）按锚点 rect 重排；
 * 组件在受控初始打开路径（onMounted）也可手动调用 updatePosition。
 *
 * SSR 安全：模块/setup 顶层不访问任何浏览器 API；document/window 监听只在
 * onMounted 注册、onBeforeUnmount 移除，回调内逻辑仅由用户事件触达；
 * getBoundingClientRect 只出现在由客户端生命周期与用户事件触发的函数内部。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ComputedRef, ComponentPublicInstance, CSSProperties } from 'vue'

/** Esc 键名（逻辑常量，非视觉值）。 */
const FLOATING_LAYER_ESCAPE_KEY = 'Escape'

/**
 * 解包模板 ref：原生元素原样返回；组件实例解包为其根元素（多根/文本根返回 null）。
 * tooltip / popover / hover-card / popconfirm / dropdown-menu 触发元素的公共判定。
 */
export function unwrapElement(
  value: HTMLElement | ComponentPublicInstance | null,
): HTMLElement | null {
  if (value instanceof HTMLElement) return value
  const inner = (value as ComponentPublicInstance | null)?.$el
  return inner instanceof HTMLElement ? inner : null
}

/** 浮层方向（anchored 策略四向；dropdown 策略恒 'bottom'）。 */
export type FloatingPlacement = 'top' | 'bottom' | 'left' | 'right'

/** 定位策略：anchored = fixed 层四向 + translate；dropdown = 文档坐标 absolute + minWidth。 */
export type FloatingStrategy = 'anchored' | 'dropdown'

/** useFloatingLayer 选项（均为 getter/回调，保持对 props / ref 的响应式依赖）。 */
export interface UseFloatingLayerOptions {
  /** 浮层打开状态 getter（监听回调与重排的唯一守卫）。 */
  isOpen: () => boolean
  /** 锚点（触发）元素 getter：定位基准；null 时跳过定位。 */
  anchor: () => HTMLElement | null
  /** 定位策略（见文件头）。 */
  strategy: FloatingStrategy
  /** anchored 策略的方向 getter（dropdown 策略不传）。 */
  placement?: () => FloatingPlacement
  /** anchored 策略与锚点的间距（token 字符串，calc 内引用；默认 --ui-space-2）。 */
  gap?: string
  /** 滚动（capture）/ resize 跟随重排（popover 家族 true；tooltip 与 dropdown 家族不跟随）。 */
  followViewport?: boolean
  /** 点击外部关闭：document（capture）监听点击。 */
  closeOnOutsideClick?: boolean
  /** 点击外部的「内部」判定元素集合（根容器、弹层等；目标落在任一元素内则放行）。 */
  insideElements?: () => Array<HTMLElement | null | undefined>
  /** onKeydown 是否受理 Esc（下拉家族在自身键盘状态机内受理 Esc 时传 false）。 */
  closeOnEscape?: boolean
  /** 关闭信号统一出口（source 区分 Esc / 外点；Esc 路径组件通常还需还原焦点）。 */
  onRequestClose: (source: 'escape' | 'outside') => void
}

/** useFloatingLayer 返回值。 */
export interface UseFloatingLayerReturn {
  /** 浮层内联定位样式（打开后由锚点 rect 计算；初始为空对象）。 */
  floatingStyle: ComputedRef<CSSProperties>
  /** 按锚点当前 rect 重算浮层位置（受控初始打开路径可手动调用）。 */
  updatePosition: () => void
  /** keydown 处理器：打开时 Esc → preventDefault + onRequestClose('escape')，其余放行。 */
  onKeydown: (event: KeyboardEvent) => void
}

/** 浮层引擎 composable（在 setup 或 composable 内调用）。 */
export function useFloatingLayer(options: UseFloatingLayerOptions): UseFloatingLayerReturn {
  const position = ref<CSSProperties>({})
  const gap = options.gap ?? 'var(--ui-space-2)'
  const placementGetter = options.placement ?? (() => 'bottom' as FloatingPlacement)

  /**
   * anchored 策略：按锚点 rect 计算视口坐标（fixed 层内绝对定位）——间距走
   * gap token（calc 内引用，无裸值），居中对齐用结构性 translate 百分比
   * （无需二段测量浮层自身尺寸）。
   */
  function updateAnchoredPosition(anchor: HTMLElement, placement: FloatingPlacement): void {
    const rect = anchor.getBoundingClientRect()
    const centerX = `${rect.left + rect.width / 2}px`
    const centerY = `${rect.top + rect.height / 2}px`

    switch (placement) {
      case 'top':
        position.value = {
          left: centerX,
          top: `calc(${rect.top}px - ${gap})`,
          transform: 'translate(-50%, -100%)',
        }
        break
      case 'bottom':
        position.value = {
          left: centerX,
          top: `calc(${rect.bottom}px + ${gap})`,
          transform: 'translate(-50%, 0)',
        }
        break
      case 'left':
        position.value = {
          left: `calc(${rect.left}px - ${gap})`,
          top: centerY,
          transform: 'translate(-100%, -50%)',
        }
        break
      case 'right':
        position.value = {
          left: `calc(${rect.right}px + ${gap})`,
          top: centerY,
          transform: 'translate(0, -50%)',
        }
        break
    }
  }

  /**
   * dropdown 策略：getBoundingClientRect() 为视口坐标；弹层 Teleport 到 body 下
   * 绝对定位，包含块是初始包含块（文档原点），须加 window.scrollX/scrollY 换算为
   * 文档坐标——否则页面滚动后打开时面板漂到文档顶部。打开期间弹层与文档同滚，
   * 无需滚动监听跟随。minWidth 对齐锚点宽度。
   */
  function updateDropdownPosition(anchor: HTMLElement): void {
    const rect = anchor.getBoundingClientRect()
    position.value = {
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      minWidth: `${rect.width}px`,
    }
  }

  /** 按锚点当前 rect 重算浮层位置（未挂载锚点时跳过）。 */
  function updatePosition(): void {
    const anchor = options.anchor()
    if (!anchor) return
    if (options.strategy === 'dropdown') updateDropdownPosition(anchor)
    else updateAnchoredPosition(anchor, placementGetter())
  }

  // 打开与打开期间的方向变化：等 Teleport 内容落地后按锚点 rect 重排。
  watch([options.isOpen, placementGetter], ([open]) => {
    if (open) void nextTick().then(updatePosition)
  })

  /* ── 全局监听（onMounted 常驻绑定、onBeforeUnmount 移除，回调以 isOpen 守卫） ── */

  /** 滚动（capture 捕获任意祖先滚动容器）与视口变化时跟随重定位。 */
  function onViewportChange(): void {
    if (!options.isOpen()) return
    updatePosition()
  }

  /** 点击外部关闭：目标在任一「内部」元素（根容器/弹层）内则交由内部处理器，否则关闭。 */
  function onDocumentClick(event: MouseEvent): void {
    if (!options.isOpen()) return
    const target = event.target
    if (!(target instanceof Node)) return
    const inside = options.insideElements?.() ?? []
    if (inside.some((element) => element?.contains(target))) return
    options.onRequestClose('outside')
  }

  onMounted(() => {
    if (options.followViewport === true) {
      document.addEventListener('scroll', onViewportChange, true)
      window.addEventListener('resize', onViewportChange)
    }
    if (options.closeOnOutsideClick === true) {
      document.addEventListener('click', onDocumentClick, true)
    }
  })

  onBeforeUnmount(() => {
    if (options.followViewport === true) {
      document.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
    }
    if (options.closeOnOutsideClick === true) {
      document.removeEventListener('click', onDocumentClick, true)
    }
  })

  /** Esc 关闭：打开时受理并 preventDefault，其余键放行。 */
  function onKeydown(event: KeyboardEvent): void {
    if (options.closeOnEscape === false) return
    if (event.key === FLOATING_LAYER_ESCAPE_KEY && options.isOpen()) {
      event.preventDefault()
      options.onRequestClose('escape')
    }
  }

  return {
    floatingStyle: computed(() => position.value),
    updatePosition,
    onKeydown,
  }
}
