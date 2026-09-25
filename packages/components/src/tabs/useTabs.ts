/**
 * useTabs —— Tabs 家族的共享状态机与键盘导航 composable（headless）。
 *
 * 收口四类语义，供 Tabs provide 给 TabsList/TabsTrigger/TabsContent：
 *   1. 受控/非受控激活值解析（v-model:value / defaultValue / 自动激活首个非 disabled）；
 *   2. trigger 注册表（roving tabindex 落点与方向键导航序；注册序即渲染序）；
 *   3. trigger/panel 元素 id 的确定性派生（根 uid + 配对值，SSR 稳定，
 *      aria-controls/aria-labelledby 不依赖对方先渲染）；
 *   4. tablist 键盘契约：←→↑↓ 循环移动、Home/End 直达，跳过 disabled，移动即激活。
 *
 * SSR 安全：不访问任何浏览器 API；focus() 仅由客户端事件回调触发。
 */
import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import {
  TABS_ID_PANEL_SUFFIX,
  TABS_ID_TAB_SUFFIX,
  TABS_NAVIGATION_KEYS,
  TABS_VARIANT_DEFAULT,
} from './Tabs.constants'
import type { TabsValue, TabsVariant } from './Tabs.types'

/** 单个 trigger 的注册信息（由 TabsTrigger 提供，供导航与 roving tabindex 使用）。 */
export interface TabsTriggerRegistration {
  /** 实例级唯一键（useId 生成）。 */
  key: string
  /** 配对值 getter（响应式）。 */
  value: () => TabsValue
  /** 是否禁用 getter（响应式）。 */
  disabled: () => boolean
  /** 聚焦根按钮元素（仅客户端事件回调中调用）。 */
  focus: () => void
}

/** Tabs → 子部件的共享上下文（provide/inject 契约，注入键见 Tabs.constants）。 */
export interface TabsController {
  /** Tabs 根的 useId，id 派生前缀。 */
  uid: string
  /** 当前生效 variant。 */
  variant: ComputedRef<TabsVariant>
  /** 当前激活值（受控优先，非受控回落内部状态）。 */
  activeValue: ComputedRef<TabsValue | undefined>
  /**
   * 激活一个值：同值不动作；受控时只发 update:value，
   * 非受控时同时写内部状态。
   */
  select: (value: TabsValue) => void
  /** roving tabindex 落点：当前激活 trigger（无激活值时首个非 disabled）。 */
  focusableTriggerKey: ComputedRef<string | undefined>
  /** 注册 trigger，返回反注册函数（TabsTrigger 于 setup/unmount 调用）。 */
  registerTrigger: (trigger: TabsTriggerRegistration) => () => void
  /** 已注册 trigger（注册序即导航序）。 */
  triggers: Readonly<Ref<readonly TabsTriggerRegistration[]>>
  /** 由配对值派生 trigger 元素 id（确定性，SSR 稳定）。 */
  triggerIdFor: (value: TabsValue) => string
  /** 由配对值派生 panel 元素 id（确定性，SSR 稳定）。 */
  contentIdFor: (value: TabsValue) => string
}

/** useTabsController 选项。 */
export interface UseTabsControllerOptions {
  /** Tabs 根 useId（id 派生前缀）。 */
  uid: string
  /** 受控 value 来源（v-model:value）。 */
  value: MaybeRefOrGetter<TabsValue | undefined>
  /** 非受控初始值（仅初始化时读取一次）。 */
  defaultValue: MaybeRefOrGetter<TabsValue | undefined>
  /** variant 来源（缺省回落 line）。 */
  variant: MaybeRefOrGetter<TabsVariant | undefined>
  /** update:value 发射器。 */
  emit: (value: TabsValue) => void
}

/** id 片段化：空白折叠为连字符，保证派生 id 无空白且确定。 */
function toIdPart(value: TabsValue): string {
  return String(value).trim().replace(/\s+/g, '-')
}

/** Tabs 共享状态机。 */
export function useTabsController(options: UseTabsControllerOptions): TabsController {
  const inner = ref<TabsValue | undefined>(toValue(options.defaultValue))
  const registered = ref<TabsTriggerRegistration[]>([])

  const isControlled = computed(() => toValue(options.value) !== undefined)
  const activeValue = computed(() => toValue(options.value) ?? inner.value)
  const variant = computed(() => toValue(options.variant) ?? TABS_VARIANT_DEFAULT)

  function select(next: TabsValue): void {
    if (activeValue.value === next) return
    if (!isControlled.value) inner.value = next
    options.emit(next)
  }

  function registerTrigger(trigger: TabsTriggerRegistration): () => void {
    registered.value = [...registered.value, trigger]
    // 非受控且尚无激活值：自动激活首个非 disabled 的 trigger（SSR 渲染期同样完成）。
    if (!isControlled.value && activeValue.value === undefined && !trigger.disabled()) {
      inner.value = trigger.value()
    }
    return () => {
      registered.value = registered.value.filter(t => t !== trigger)
    }
  }

  const focusableTriggerKey = computed(() => {
    const list = registered.value
    const active = list.find(t => t.value() === activeValue.value)
    if (active) return active.key
    return list.find(t => !t.disabled())?.key
  })

  function triggerIdFor(value: TabsValue): string {
    return `${options.uid}-${TABS_ID_TAB_SUFFIX}-${toIdPart(value)}`
  }

  function contentIdFor(value: TabsValue): string {
    return `${options.uid}-${TABS_ID_PANEL_SUFFIX}-${toIdPart(value)}`
  }

  return {
    uid: options.uid,
    variant,
    activeValue,
    select,
    focusableTriggerKey,
    registerTrigger,
    triggers: registered,
    triggerIdFor,
    contentIdFor,
  }
}

/**
 * tablist keydown 处理器：←→↑↓ 循环移动、Home/End 直达首末，
 * 跳过 disabled，移动即激活（select + focus）。
 * 仅在客户端事件回调中执行（focus 副作用）；无 trigger 时不动、不拦截默认行为。
 */
export function createTabsKeydownHandler(
  controller: TabsController,
): (event: KeyboardEvent) => void {
  return (event) => {
    if (!TABS_NAVIGATION_KEYS.includes(event.key)) return
    const enabled = controller.triggers.value.filter(t => !t.disabled())
    if (enabled.length === 0) return

    const current = enabled.findIndex(t => t.value() === controller.activeValue.value)
    let next: number
    switch (event.key) {
      case 'Home':
        next = 0
        break
      case 'End':
        next = enabled.length - 1
        break
      case 'ArrowRight':
      case 'ArrowDown':
        next = current === -1 ? 0 : (current + 1) % enabled.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = current === -1 ? enabled.length - 1 : (current - 1 + enabled.length) % enabled.length
        break
      default:
        return
    }

    event.preventDefault()
    const target = enabled[next]
    controller.select(target.value())
    target.focus()
  }
}
