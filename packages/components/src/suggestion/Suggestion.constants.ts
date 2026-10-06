/**
 * suggestion/ —— 逻辑常量收口（键名、空态默认文案；不是视觉值，视觉只走 --ui-* token）。
 */

/**
 * 键盘激活键：原生 button 的 Enter / Space 激活行为。
 * 与 button 家族一致：keydown 阶段统一 preventDefault 后上抛 select，
 * 保证测试环境（happy-dom）与真实浏览器行为一致且不双触发。
 */
export const SUGGESTION_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']

/** items 为空时的默认空态文案（对齐 select/autocomplete 家族的空态先例命名）。 */
export const SUGGESTION_EMPTY_TEXT_DEFAULT = '暂无建议' as const
