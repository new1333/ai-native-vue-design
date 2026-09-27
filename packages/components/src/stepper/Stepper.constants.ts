/**
 * stepper/ —— 逻辑常量收口（状态名、方向名、默认值；不是视觉值，视觉只走 --ui-* token）。
 */

/** 步骤状态全集（与 Stepper.types.ts 的 StepperStatus 一一对应）。 */
export const STEPPER_STATUSES = ['waiting', 'process', 'finish', 'error'] as const

/**
 * 当前步的默认状态（status prop 缺省时生效）：
 * 当前步 process、已完成步 finish、未到步 waiting。
 */
export const STEPPER_STATUS_DEFAULT = 'process' as const

/** 方向全集（与 Stepper.types.ts 的 StepperDirection 一一对应）。 */
export const STEPPER_DIRECTIONS = ['horizontal', 'vertical'] as const

/** 默认方向。 */
export const STEPPER_DIRECTION_DEFAULT = 'horizontal' as const

/** 当前步索引默认值（modelValue 缺省时从第 0 步开始）。 */
export const STEPPER_MODEL_VALUE_DEFAULT = 0

/**
 * 步骤激活键：原生 button 的 Enter / Space。
 * Stepper 统一在 keydown 阶段 preventDefault 后由组件唯一触发选中，
 * 保证测试环境（happy-dom/node）与真实浏览器行为一致且不双触发（同 TabsTrigger 策略）。
 */
export const STEPPER_ACTIVATION_KEYS: readonly string[] = ['Enter', ' ', 'Spacebar']
