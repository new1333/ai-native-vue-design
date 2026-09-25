/**
 * tabs/ —— 逻辑常量收口（键名、注入键；不是视觉值，视觉只走 --ui-* token）。
 */
import type { InjectionKey } from 'vue'
import type { TabsController } from './useTabs'

/** variant 全集（与 Tabs.types.ts 的 TabsVariant 一一对应）。 */
export const TABS_VARIANTS = ['line', 'pill'] as const

/** 默认 variant（本期实现 line；pill 为预留档位，视觉未实现）。 */
export const TABS_VARIANT_DEFAULT = 'line' as const

/**
 * tablist 键盘导航键：←→↑↓ 在 trigger 间循环移动、Home/End 直达首末，
 * 移动即激活（automatic activation）并跳过 disabled。
 */
export const TABS_NAVIGATION_KEYS: readonly string[] = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]

/**
 * trigger 激活键：原生 button 的 Enter / Space。
 * TabsTrigger 统一在 keydown 阶段 preventDefault 后由组件唯一触发选中，
 * 保证测试环境（happy-dom/node）与真实浏览器行为一致且不双触发（同 useButton 策略）。
 */
export const TABS_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']

/** trigger 元素 id 的档位片段（aria-labelledby 目标）。 */
export const TABS_ID_TAB_SUFFIX = 'tab'

/** content 元素 id 的档位片段（aria-controls 目标）。 */
export const TABS_ID_PANEL_SUFFIX = 'panel'

/**
 * 注入键：Tabs → TabsList/TabsTrigger/TabsContent 的共享上下文
 * （激活值、variant、trigger 注册表、id 派生）。
 */
export const TABS_INJECTION_KEY: InjectionKey<TabsController> = Symbol('ui-tabs-context')
