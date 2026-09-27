/**
 * useStepper —— Stepper 的状态派生 composable（headless）。
 *
 * 收口三类语义：
 *   1. 当前步解析（受控 modelValue，缺省回落默认 0；组件不持有内部步状态）；
 *   2. 每步状态派生（已完成 finish / 当前 process（或 status 覆盖）/ 未到 waiting）；
 *   3. 可交互网关（clickable 时仅「已完成且未禁用」的步骤可选中，
 *      即只允许回退到已完成步骤，不允许跳过未完成步骤前跳）。
 *
 * 全部为纯 computed 派生与纯函数，不访问任何浏览器 API，SSR 安全。
 */
import { computed } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  STEPPER_MODEL_VALUE_DEFAULT,
  STEPPER_STATUS_DEFAULT,
} from './Stepper.constants'
import type { StepperStatus, StepperStep } from './Stepper.types'

/** useStepper 选项（均以 getter 传入保持响应式）。 */
export interface UseStepperOptions {
  /** 步骤配置序列来源。 */
  steps: MaybeRefOrGetter<StepperStep[]>
  /** 受控当前步索引来源（v-model:modelValue）。 */
  modelValue: MaybeRefOrGetter<number | undefined>
  /** 当前步状态覆盖来源（缺省回落 process）。 */
  status: MaybeRefOrGetter<StepperStatus | undefined>
  /** 是否开启步骤点击切换来源。 */
  clickable: MaybeRefOrGetter<boolean | undefined>
}

/** Stepper 共享状态派生。 */
export interface StepperController {
  /** 当前步索引（受控 modelValue 优先，缺省 0）。 */
  current: ComputedRef<number>
  /**
   * 派生某一步的状态：当前步 → status 覆盖（默认 process）；
   * 已过步 → finish；未到步 → waiting。modelValue 越界时无当前步，全部按 finish/waiting 落位。
   */
  statusFor: (index: number) => StepperStatus
  /**
   * 某一步是否可被选中（点击 / Enter / Space 的网关）：
   * clickable 开启 且 该步状态为 finish 且 未禁用 且 非当前步。
   */
  canSelect: (index: number) => boolean
}

/** Stepper 状态机。 */
export function useStepper(options: UseStepperOptions): StepperController {
  const current = computed(
    () => toValue(options.modelValue) ?? STEPPER_MODEL_VALUE_DEFAULT,
  )

  function statusFor(index: number): StepperStatus {
    if (index === current.value) {
      return toValue(options.status) ?? STEPPER_STATUS_DEFAULT
    }
    return index < current.value ? 'finish' : 'waiting'
  }

  function canSelect(index: number): boolean {
    if (toValue(options.clickable) !== true) return false
    if (index === current.value) return false
    const step = toValue(options.steps)[index]
    if (step == null || step.disabled === true) return false
    return statusFor(index) === 'finish'
  }

  return { current, statusFor, canSelect }
}
