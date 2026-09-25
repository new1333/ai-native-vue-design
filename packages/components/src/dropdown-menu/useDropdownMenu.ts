/**
 * useDropdownMenu —— DropdownMenu 的浮层交互 composable：
 *
 *   1. 开合状态与 roving focus：↓/↑ 环绕移动（跳过 disabled）、Home/End 首尾；
 *   2. 选中：Enter / 点击项 → onSelect + 关闭 + 焦点还原触发器；
 *   3. 关闭：Esc / Tab / 外点（document click capture，策略同 select/：
 *      onMounted 常驻绑定 + open 守卫，根内/浮层内点击交给内部处理器）；
 *      键盘关闭还原焦点到触发器，外点关闭不抢焦点；
 *   4. 定位：浮层锚盒（fixed）钉在触发器 rect 上，面板在锚盒内绝对定位实现
 *      start/end 对齐；打开与滚动/resize 时按当前 rect 重算。
 *
 * SSR 安全：模块/setup 顶层不访问任何浏览器 API；document/window 监听只在
 * onMounted 注册、onBeforeUnmount 移除，回调内逻辑仅由用户事件触达。
 */
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import {
  DROPDOWN_MENU_ITEM_SELECTOR,
  DROPDOWN_MENU_KEY_ARROW_DOWN,
  DROPDOWN_MENU_KEY_ARROW_UP,
  DROPDOWN_MENU_KEY_END,
  DROPDOWN_MENU_KEY_ENTER,
  DROPDOWN_MENU_KEY_ESCAPE,
  DROPDOWN_MENU_KEY_HOME,
  DROPDOWN_MENU_KEY_SPACE,
  DROPDOWN_MENU_KEY_TAB,
} from './DropdownMenu.constants'
import type { DropdownMenuItem } from './DropdownMenu.types'

/** 打开菜单时的初始焦点位置：first=首个启用项 / last=最后一个启用项（↑ 打开）。 */
export type DropdownMenuOpenPosition = 'first' | 'last'

/** useDropdownMenu 选项。 */
export interface UseDropdownMenuOptions {
  /** 触发器元素 getter（关闭还原焦点 / 定位基准）。 */
  trigger: () => HTMLElement | null
  /** 浮层锚盒元素 getter（fixed 定位 + menuitem 查询范围）。 */
  flyout: () => HTMLElement | null
  /** 菜单项数据 getter（启用项判定与选中映射）。 */
  items: () => readonly DropdownMenuItem[]
  /** 选中回调（仅在未禁用项上调用）。 */
  onSelect: (item: DropdownMenuItem) => void
}

/** useDropdownMenu 返回值。 */
export interface UseDropdownMenuReturn {
  /** 菜单是否打开。 */
  isOpen: Ref<boolean>
  /** roving focus 锚点（items 原始下标；-1 表示无激活项）。 */
  activeIndex: Ref<number>
  /** 打开菜单并把焦点移入初始启用项（DOM 就绪后）。 */
  openMenu: (position?: DropdownMenuOpenPosition) => void
  /** 关闭菜单；restoreFocus 为 true（默认）时焦点还原到触发器。 */
  closeMenu: (restoreFocus?: boolean) => void
  /** 选中一项：发出 select 并关闭、焦点还原触发器；disabled 项忽略。 */
  selectItem: (item: DropdownMenuItem) => void
  /** 触发器 keydown 处理器（↓/↑ 打开、Enter/Space 开合、Esc 关闭）。 */
  onTriggerKeydown: (event: KeyboardEvent) => void
  /** 菜单 keydown 处理器（↓/↑/Home/End roving、Enter 选中、Esc/Tab 关闭）。 */
  onMenuKeydown: (event: KeyboardEvent) => void
  /** 按触发器当前 rect 重算浮层锚盒位置（inline left/top/width/height）。 */
  updatePosition: () => void
}

/** DropdownMenu 浮层交互 composable（仅在 setup 中调用）。 */
export function useDropdownMenu(options: UseDropdownMenuOptions): UseDropdownMenuReturn {
  const isOpen = ref(false)
  /** roving tabindex 锚点：与激活项双向同步（箭头移动同时更新 tabindex 与 DOM 焦点）。 */
  const activeIndex = ref(-1)

  /** items 中未禁用项的下标集合（保持 items 序）。 */
  function enabledIndexes(): number[] {
    return options
      .items()
      .map((item, index) => (item.disabled ? -1 : index))
      .filter(index => index >= 0)
  }

  /** 锚盒内全部 menuitem 元素（DOM 序与 items 一致，含 disabled 项以保序）。 */
  function itemElements(): HTMLElement[] {
    const flyout = options.flyout()
    if (!flyout) return []
    return Array.from(flyout.querySelectorAll<HTMLElement>(DROPDOWN_MENU_ITEM_SELECTOR))
  }

  /** 把 roving 锚点与 DOM 焦点移到指定项（items 原始下标）。 */
  function focusItemAt(index: number): void {
    activeIndex.value = index
    itemElements()[index]?.focus()
  }

  /** 从当前锚点按方向环绕移动到下一个启用项。 */
  function stepEnabled(direction: 1 | -1): number {
    const enabled = enabledIndexes()
    if (enabled.length === 0) return -1
    const current = enabled.indexOf(activeIndex.value)
    if (current === -1) return direction === 1 ? enabled[0] : enabled[enabled.length - 1]
    const next = (current + direction + enabled.length) % enabled.length
    return enabled[next]
  }

  /** 按触发器 rect 把锚盒钉在触发器正上方（面板在其内 top:100% + start/end 对齐）。 */
  function updatePosition(): void {
    const trigger = options.trigger()
    const flyout = options.flyout()
    if (!trigger || !flyout) return
    const rect = trigger.getBoundingClientRect()
    flyout.style.left = `${rect.left}px`
    flyout.style.top = `${rect.top}px`
    flyout.style.width = `${rect.width}px`
    flyout.style.height = `${rect.height}px`
  }

  /* ── 全局监听（onMounted 常驻绑定、onBeforeUnmount 移除，回调以 isOpen 守卫） ── */

  /** 外点关闭（策略同 select/）：目标在触发器或浮层内交给内部处理器，否则关闭（不抢焦点）。 */
  function onDocumentClick(event: Event): void {
    if (!isOpen.value) return
    const target = event.target
    if (!(target instanceof Node)) return
    if (options.trigger()?.contains(target)) return
    if (options.flyout()?.contains(target)) return
    closeMenu(false)
  }

  /** 滚动（capture 捕获任意祖先滚动容器）与视口变化时跟随重定位。 */
  function onViewportChange(): void {
    if (!isOpen.value) return
    updatePosition()
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick, true)
    document.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick, true)
    document.removeEventListener('scroll', onViewportChange, true)
    window.removeEventListener('resize', onViewportChange)
    // 卸载兜底：打开状态下卸载也要复位状态（不抢焦点）。
    if (isOpen.value) closeMenu(false)
  })

  /* ── 开合 ────────────────────────────────────────────────────────── */

  function openMenu(position: DropdownMenuOpenPosition = 'first'): void {
    const enabled = enabledIndexes()
    const target =
      enabled.length === 0
        ? -1
        : position === 'last'
          ? enabled[enabled.length - 1]
          : enabled[0]
    isOpen.value = true
    // 浮层在状态更新后的下一次渲染落地；定位与移焦等 DOM 就绪再执行。
    void nextTick().then(() => {
      if (!isOpen.value) return
      updatePosition()
      if (target >= 0) focusItemAt(target)
    })
  }

  function closeMenu(restoreFocus = true): void {
    if (!isOpen.value) return
    isOpen.value = false
    activeIndex.value = -1
    if (restoreFocus) options.trigger()?.focus()
  }

  /** 选中一项：发出 select 并关闭、焦点还原触发器；disabled 项忽略（兜底合成事件）。 */
  function selectItem(item: DropdownMenuItem): void {
    if (item.disabled) return
    options.onSelect(item)
    closeMenu()
  }

  /* ── 键盘 ────────────────────────────────────────────────────────── */

  function onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === DROPDOWN_MENU_KEY_ARROW_DOWN) {
      event.preventDefault()
      openMenu('first')
    } else if (event.key === DROPDOWN_MENU_KEY_ARROW_UP) {
      event.preventDefault()
      openMenu('last')
    } else if (event.key === DROPDOWN_MENU_KEY_ENTER || event.key === DROPDOWN_MENU_KEY_SPACE) {
      // 统一在 keydown 拦截原生激活（避免真实浏览器与测试环境行为分叉/双触发）。
      event.preventDefault()
      if (isOpen.value) closeMenu()
      else openMenu('first')
    } else if (event.key === DROPDOWN_MENU_KEY_ESCAPE && isOpen.value) {
      event.preventDefault()
      closeMenu()
    }
  }

  function onMenuKeydown(event: KeyboardEvent): void {
    if (!isOpen.value) return
    switch (event.key) {
      case DROPDOWN_MENU_KEY_ARROW_DOWN:
        event.preventDefault()
        focusItemAt(stepEnabled(1))
        break
      case DROPDOWN_MENU_KEY_ARROW_UP:
        event.preventDefault()
        focusItemAt(stepEnabled(-1))
        break
      case DROPDOWN_MENU_KEY_HOME: {
        event.preventDefault()
        const [first] = enabledIndexes()
        if (first !== undefined) focusItemAt(first)
        break
      }
      case DROPDOWN_MENU_KEY_END: {
        event.preventDefault()
        const enabled = enabledIndexes()
        if (enabled.length > 0) focusItemAt(enabled[enabled.length - 1])
        break
      }
      case DROPDOWN_MENU_KEY_ENTER: {
        // 拦截原生 button 的 Enter 激活，统一走唯一一次选中路径。
        event.preventDefault()
        const item = options.items()[activeIndex.value]
        if (item) selectItem(item)
        break
      }
      case DROPDOWN_MENU_KEY_ESCAPE:
      case DROPDOWN_MENU_KEY_TAB:
        // Esc/Tab 关闭并还原焦点到触发器（menu 模式不放行 Tab 离开浮层）。
        event.preventDefault()
        closeMenu()
        break
      default:
        break
    }
  }

  return {
    isOpen,
    activeIndex,
    openMenu,
    closeMenu,
    selectItem,
    onTriggerKeydown,
    onMenuKeydown,
    updatePosition,
  }
}
