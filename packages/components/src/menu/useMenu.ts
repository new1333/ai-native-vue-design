/**
 * useMenu —— Menu 家族的共享状态机与键盘导航 composable（headless）。
 *
 * 收口四类语义，供 Menu provide 给 MenuItem/SubMenu：
 *   1. 受控/非受控激活值解析（v-model:modelValue / defaultValue；导航菜单不自动选中首项）；
 *   2. 项注册表（roving tabindex 落点与方向键导航序；注册序即 DOM 序——
 *      SubMenu 面板以 v-show 常驻挂载，注册序天然为深度优先）；
 *   3. 导航层级上下文（MenuLevelContext）：每层 SubMenu 报告自身是否处于
 *      可见导航链（祖先组全部展开），并持有 Esc 收起 + 回焦触发器的句柄；
 *   4. 项键盘契约：←→↑↓ 在「可见且可用」项间循环移动、Home/End 直达，
 *      跳过 disabled 与收起组内项；移动只迁移焦点，Enter/Space/点击才激活。
 *
 * SSR 安全：不访问任何浏览器 API；focus() 仅由客户端事件回调触发。
 */
import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { MENU_ACTIVATION_KEYS, MENU_COLLAPSE_KEY, MENU_NAVIGATION_KEYS } from './Menu.constants'
import type { MenuValue } from './Menu.types'

/** 单个菜单项/组触发器的注册信息（供 roving tabindex 与方向键导航使用）。 */
export interface MenuItemRegistration {
  /** 实例级唯一键（useId 生成）。 */
  key: string
  /** 项标识 getter（响应式）。 */
  value: () => MenuValue
  /** 是否为组触发器（组不可选中，不参与激活值匹配）。 */
  isGroup: boolean
  /** 是否禁用 getter（响应式）。 */
  disabled: () => boolean
  /** 是否处于可见导航链 getter（祖先组全部展开）。 */
  visible: () => boolean
  /** 聚焦该项根按钮元素（仅客户端事件回调中调用）。 */
  focus: () => void
}

/** Menu → 子部件的共享上下文（provide/inject 契约，注入键见 Menu.constants）。 */
export interface MenuController {
  /** Menu 根的 useId，id 派生前缀。 */
  uid: string
  /** 当前生效 mode。 */
  mode: ComputedRef<'horizontal' | 'vertical'>
  /** 当前生效 collapsed。 */
  collapsed: ComputedRef<boolean>
  /** 当前激活值（受控优先，非受控回落内部状态；组触发器不参与匹配）。 */
  activeValue: ComputedRef<MenuValue | undefined>
  /**
   * 激活一个值：同值不动作；受控时只发 update:modelValue，
   * 非受控时同时写内部状态（select 事件由根组件在该发射器内一并发出）。
   */
  select: (value: MenuValue) => void
  /** roving tabindex 落点：可见可用项中激活项优先，否则首个。 */
  focusableKey: ComputedRef<string | undefined>
  /** 注册项，返回反注册函数（MenuItem/SubMenu 于 setup/unmount 调用）。 */
  registerItem: (item: MenuItemRegistration) => () => void
  /** 已注册项（注册序即 DOM 序，深度优先）。 */
  items: Readonly<Ref<readonly MenuItemRegistration[]>>
  /**
   * 自 fromKey 起，按 navKey 在「可见且可用」项间移动焦点：
   * ←→↑↓ 循环、Home/End 直达。无可用项或键不参与导航时不动。
   */
  moveFocus: (fromKey: string, navKey: string) => void
}

/** 导航层级上下文（Menu 根层与每层 SubMenu 各提供一份；注入键见 Menu.constants）。 */
export interface MenuLevelContext {
  /** 本层内容是否处于可见导航链（全部祖先组已展开；根层恒真）。 */
  visible: ComputedRef<boolean>
  /** Esc 收起本层并回焦触发器（仅 SubMenu 层提供；根层缺省）。 */
  collapseAndFocusTrigger?: () => void
}

/** id 片段化：空白折叠为连字符，保证派生 id 无空白且确定。 */
export function toMenuIdPart(value: MenuValue): string {
  return String(value).trim().replace(/\s+/g, '-')
}

/** useMenuController 选项。 */
export interface UseMenuControllerOptions {
  /** Menu 根 useId（id 派生前缀）。 */
  uid: string
  /** mode 来源（缺省回落 vertical）。 */
  mode: MaybeRefOrGetter<'horizontal' | 'vertical' | undefined>
  /** collapsed 来源（缺省 false）。 */
  collapsed: MaybeRefOrGetter<boolean | undefined>
  /** 受控 modelValue 来源（v-model:modelValue）。 */
  modelValue: MaybeRefOrGetter<MenuValue | undefined>
  /** 非受控初始值（仅初始化时读取一次）。 */
  defaultValue: MaybeRefOrGetter<MenuValue | undefined>
  /** 激活发射器：根组件在此一并发出 update:modelValue 与 select。 */
  emit: (value: MenuValue) => void
}

/** Menu 共享状态机。 */
export function useMenuController(options: UseMenuControllerOptions): MenuController {
  const inner = ref<MenuValue | undefined>(toValue(options.defaultValue))
  const registered = ref<MenuItemRegistration[]>([])

  const isControlled = computed(() => toValue(options.modelValue) !== undefined)
  const activeValue = computed(() => toValue(options.modelValue) ?? inner.value)
  const mode = computed(() => toValue(options.mode) ?? 'vertical')
  const collapsed = computed(() => toValue(options.collapsed) ?? false)

  function select(next: MenuValue): void {
    if (activeValue.value === next) return
    if (!isControlled.value) inner.value = next
    options.emit(next)
  }

  function registerItem(item: MenuItemRegistration): () => void {
    registered.value = [...registered.value, item]
    return () => {
      registered.value = registered.value.filter(t => t !== item)
    }
  }

  /** 可见且可用的项（方向键导航与 roving 落点的共同池）。 */
  function enabledPool(): MenuItemRegistration[] {
    return registered.value.filter(t => t.visible() && !t.disabled())
  }

  const focusableKey = computed(() => {
    const pool = enabledPool()
    if (pool.length === 0) return undefined
    const active = pool.find(t => !t.isGroup && t.value() === activeValue.value)
    return (active ?? pool[0]).key
  })

  function moveFocus(fromKey: string, navKey: string): void {
    if (!MENU_NAVIGATION_KEYS.includes(navKey)) return
    const pool = enabledPool()
    if (pool.length === 0) return

    const current = pool.findIndex(t => t.key === fromKey)
    let next: number
    switch (navKey) {
      case 'Home':
        next = 0
        break
      case 'End':
        next = pool.length - 1
        break
      case 'ArrowRight':
      case 'ArrowDown':
        next = current === -1 ? 0 : (current + 1) % pool.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = current === -1 ? pool.length - 1 : (current - 1 + pool.length) % pool.length
        break
      default:
        return
    }
    pool[next].focus()
  }

  return {
    uid: options.uid,
    mode,
    collapsed,
    activeValue,
    select,
    focusableKey,
    registerItem,
    items: registered,
    moveFocus,
  }
}

/**
 * 项 keydown 处理器工厂：Enter/Space 激活（preventDefault 后单次触发）；
 * ←→↑↓ 循环移动焦点、Home/End 直达（跳过 disabled 与收起组内项，
 * preventDefault 防滚动）；Esc 收起最近一层子菜单并回焦其触发器。
 * 仅在客户端事件回调中执行（focus 副作用）。
 */
export function createMenuItemKeydownHandler(
  controller: MenuController,
  handlers: {
    /** 当前项的注册键。 */
    key: string
    /** 激活逻辑（叶子项 select / 组触发器 toggle；disabled 已由调用方拦截）。 */
    activate: () => void
    /** 当前项所在层（Esc 收起最近一层子菜单；根层无 collapse 句柄）。 */
    level: MenuLevelContext | null
  },
): (event: KeyboardEvent) => void {
  return (event) => {
    if (MENU_ACTIVATION_KEYS.includes(event.key)) {
      // keydown 统一 preventDefault（拦截原生二次激活与 Space 滚动），
      // 由组件唯一触发，保证各环境单次激活（同 useTabs 策略）。
      event.preventDefault()
      handlers.activate()
      return
    }
    if (MENU_NAVIGATION_KEYS.includes(event.key)) {
      const pool = controller.items.value.filter(t => t.visible() && !t.disabled())
      if (pool.length === 0) return
      event.preventDefault()
      controller.moveFocus(handlers.key, event.key)
      return
    }
    if (event.key === MENU_COLLAPSE_KEY) {
      if (handlers.level?.collapseAndFocusTrigger == null) return
      event.preventDefault()
      handlers.level.collapseAndFocusTrigger()
      return
    }
  }
}
