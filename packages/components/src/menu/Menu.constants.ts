/**
 * menu/ —— 逻辑常量收口（键名、注入键、id 片段；不是视觉值，视觉只走 --ui-* token）。
 */
import type { InjectionKey } from 'vue'
import type { MenuController } from './useMenu'
import type { MenuLevelContext } from './useMenu'

/** mode 全集（与 Menu.types.ts 的 MenuMode 一一对应）。 */
export const MENU_MODES = ['horizontal', 'vertical'] as const

/** 默认 mode（纵向侧边导航是站点菜单的主形态）。 */
export const MENU_MODE_DEFAULT = 'vertical' as const

/** collapsed（图标栏）仅在 vertical 下生效；horizontal 下忽略并告警。 */
export const MENU_COLLAPSED_SUPPORTED_MODE = 'vertical' as const

/**
 * 菜单项键盘导航键：←→↑↓ 均在可见可用项间循环移动（覆盖任务要求的
 * 「横向 ↑↓、纵向 ←→」，同时兼容两种 mode 的主轴习惯）、Home/End 直达首末。
 * 移动只迁移 roving tabindex 焦点，不激活（Enter/Space/点击才激活）。
 */
export const MENU_NAVIGATION_KEYS: readonly string[] = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]

/**
 * 项激活键：原生 button 的 Enter / Space。
 * 统一在 keydown 阶段 preventDefault 后由组件单次触发，
 * 保证测试环境（happy-dom/node）与真实浏览器行为一致且不双触发（同 useTabs 策略）。
 */
export const MENU_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']

/** 子菜单收起键（APG disclosure：Esc 收起当前层并回焦触发器）。 */
export const MENU_COLLAPSE_KEY = 'Escape'

/** 子菜单触发器元素 id 的档位片段（aria-labelledby 目标）。 */
export const MENU_ID_SUBMENU_SUFFIX = 'submenu'

/** 子菜单面板元素 id 的档位片段（aria-controls 目标）。 */
export const MENU_ID_PANEL_SUFFIX = 'panel'

/** 激活项的 aria-current 取值：导航菜单语义标记当前页/当前位置。 */
export const MENU_ARIA_CURRENT = 'page'

/**
 * 注入键：Menu → MenuItem/SubMenu 的共享上下文
 * （激活值、mode/collapsed、项注册表、焦点移动）。
 */
export const MENU_INJECTION_KEY: InjectionKey<MenuController> = Symbol('ui-menu-context')

/**
 * 注入键：导航层级上下文（Menu 根层与每层 SubMenu 各提供一份）。
 * MenuItem/SubMenu 据此判定自身是否处于可见导航链，并在 Esc 时收起最近一层。
 */
export const MENU_LEVEL_INJECTION_KEY: InjectionKey<MenuLevelContext> = Symbol('ui-menu-level')
