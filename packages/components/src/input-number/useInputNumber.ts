/**
 * useInputNumber —— InputNumber 的数值状态机 composable（headless）。
 *
 * 收口步进/范围/精度的全部纯逻辑，不含任何 DOM / 浏览器 API：
 *   1. 生效值（value）：受控 modelValue 经 [min, max] 钳制后的结果（展示与 aria 的唯一事实源）；
 *   2. 编辑草稿（editingText）：用户键入的原始文本；null = 非编辑态（展示格式化生效值）；
 *   3. 提交（commit）：草稿 → 解析 → 钳制 → 精度取整 → 与生效值比较，实际变化才经 onChange 出口；
 *   4. 定向步进（stepUp/stepDown）：基于「当前呈现值」（草稿优先，否则生效值）加减
 *      step × multiplier，钳制取整后生效；到达边界无变化时不发出任何事件；
 *   5. 跳边界（toBound）：Home/End 跳到 min/max（未定义该边界时不动）；
 *   6. 键盘状态机（handleKeydown）：受理键一律 preventDefault，其余放行。
 *
 * SSR 安全：不访问任何浏览器 API；KeyboardEvent 仅读取 key 并调用 preventDefault。
 */
import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import {
  INPUT_NUMBER_KEYS,
  INPUT_NUMBER_PAGE_STEP_MULTIPLIER,
  INPUT_NUMBER_STEP_DEFAULT,
} from './InputNumber.constants'
import type { InputNumberStepDirection, InputNumberValue } from './InputNumber.types'

/** useInputNumber 选项（各 prop 均为响应式来源）。 */
export interface UseInputNumberOptions {
  /** 受控当前值来源；null = 空。 */
  modelValue: MaybeRefOrGetter<InputNumberValue>
  /** 允许的最小值；undefined = 无下界。 */
  min?: MaybeRefOrGetter<number | undefined>
  /** 允许的最大值；undefined = 无上界。 */
  max?: MaybeRefOrGetter<number | undefined>
  /** 步长来源；非法（非有限正数）时回退默认 1。 */
  step?: MaybeRefOrGetter<number | undefined>
  /** 小数位数来源；非法（负数/非有限）时视为不干预。 */
  precision?: MaybeRefOrGetter<number | undefined>
  /** 禁用总闸（响应式）：步进与键盘路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean>
  /**
   * 值实际变化的唯一出口（组件把 update:modelValue + change 挂到这里）。
   * 载荷为钳制/取整后的最终值；与生效值相同（含在边界上原地步进）时不回调。
   */
  onChange?: (value: InputNumberValue) => void
  /** 一次定向步进实际生效后的出口（组件把 step 事件挂到这里）：方向 + 步进后的值。 */
  onStep?: (direction: InputNumberStepDirection, value: number) => void
}

/** useInputNumber 返回值。 */
export interface UseInputNumberReturn {
  /** 当前生效值：受控值经 [min, max] 钳制后的结果（null = 空）。 */
  value: ComputedRef<InputNumberValue>
  /** 生效值的格式化文本（precision 有定义时按 toFixed 补齐小数位；null = 空串）。 */
  formatted: ComputedRef<string>
  /** 编辑中的草稿文本；null = 非编辑态（展示 formatted）。 */
  editingText: Ref<string | null>
  /** 规范化步长：非法输入回退默认 1。 */
  effectiveStep: ComputedRef<number>
  /** 规范化精度：非法输入视为不干预（undefined）。 */
  effectivePrecision: ComputedRef<number | undefined>
  /** 把数值钳制到 [min, max]（未定义的边界不参与）。 */
  clamp: (value: number) => number
  /** 解析草稿文本：空串 → null；合法数字 → number；无法解析 → undefined。 */
  parse: (text: string) => InputNumberValue | undefined
  /** 定向步进：direction 决定加减，multiplier 为步长倍数（PageUp/PageDown 传 10）。 */
  stepBy: (direction: InputNumberStepDirection, multiplier?: number) => void
  /** 跳到边界：'min' | 'max'（该边界未定义时不动）。 */
  toBound: (edge: 'min' | 'max') => void
  /** 原生 input 事件路径：把输入框最新文本记为编辑草稿。 */
  handleInput: (event: Event) => void
  /**
   * 键盘状态机（绑定在原生 input 的 keydown）：
   * ↑/↓ 逐 step、PageUp/PageDown 跨 step × 10、Home/End 跳边界、Enter 提交草稿；
   * 受理键一律 preventDefault（阻止 ↑↓/PgUp/PgDn 的光标移动与滚动），其余键放行。
   */
  handleKeydown: (event: KeyboardEvent) => void
  /** 提交编辑草稿（blur / Enter 路径）：解析失败回退展示生效值且不发事件。 */
  commit: () => void
}

/** 统计十进制小数位（用于消除步进加法的浮点噪声；科学计数法返回 0 放弃修正）。 */
function countDecimals(n: number): number {
  if (!Number.isFinite(n)) return 0
  const text = String(n)
  if (text.includes('e') || text.includes('E')) return 0
  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
}

/** InputNumber 数值状态机（纯逻辑，无 DOM）。 */
export function useInputNumber(options: UseInputNumberOptions): UseInputNumberReturn {
  const editingText = ref<string | null>(null)

  const disabled = computed(() => toValue(options.disabled) === true)

  const effectiveStep = computed<number>(() => {
    const raw = toValue(options.step)
    return raw !== undefined && Number.isFinite(raw) && raw > 0 ? raw : INPUT_NUMBER_STEP_DEFAULT
  })

  const effectivePrecision = computed<number | undefined>(() => {
    const raw = toValue(options.precision)
    return raw !== undefined && Number.isFinite(raw) && raw >= 0 ? Math.trunc(raw) : undefined
  })

  /** 生效值：受控值钳制到 [min, max]；null（空）原样通过。 */
  const value = computed<InputNumberValue>(() => {
    const raw = toValue(options.modelValue)
    return raw === null ? null : clamp(raw)
  })

  /** 生效值的格式化文本：precision 有定义时按 toFixed 补齐，否则 String。 */
  const formatted = computed<string>(() => format(value.value))

  function format(v: InputNumberValue): string {
    if (v === null) return ''
    const precision = effectivePrecision.value
    return precision !== undefined ? v.toFixed(precision) : String(v)
  }

  function clamp(n: number): number {
    let out = n
    const min = toValue(options.min)
    if (min !== undefined) out = Math.max(out, min)
    const max = toValue(options.max)
    if (max !== undefined) out = Math.min(out, max)
    return out
  }

  function parse(text: string): InputNumberValue | undefined {
    const trimmed = text.trim()
    if (trimmed === '') return null
    const n = Number(trimmed)
    return Number.isNaN(n) ? undefined : n
  }

  /**
   * 按精度/操作数小数位取整：precision 有定义时以 precision 为准；
   * 否则按参与运算的操作数小数位取整，消除步进加法的浮点噪声（0.1 + 0.2 → 0.3）。
   */
  function roundToPrecision(n: number, operands: number[]): number {
    const precision = effectivePrecision.value
    if (precision !== undefined) return Number(n.toFixed(precision))
    const decimals = Math.max(0, ...operands.map(countDecimals))
    return Number(n.toFixed(decimals))
  }

  /**
   * 值出口收口：钳制 + 取整后与生效值比较，实际变化才回调 onChange。
   * 同时消费编辑草稿（步进/提交都意味着草稿生命期结束，展示回到格式化生效值）。
   */
  function applyValue(next: InputNumberValue, operands?: number[]): void {
    editingText.value = null
    if (next === null) {
      if (value.value !== null) options.onChange?.(null)
      return
    }
    const normalized = roundToPrecision(clamp(next), operands ?? [next])
    if (normalized === value.value) return
    options.onChange?.(normalized)
  }

  /** 当前呈现值：编辑草稿优先（步进总是基于用户看到/键入的值），否则生效值。 */
  function presentedValue(): InputNumberValue {
    const draft = editingText.value
    if (draft !== null) {
      const parsed = parse(draft)
      if (parsed !== undefined) return parsed
    }
    return value.value
  }

  function stepBy(direction: InputNumberStepDirection, multiplier = 1): void {
    if (disabled.value) return
    const presented = presentedValue()
    // 空值起步：有 min 从 min 起步，否则从 0 起步（确定性入口）。
    const base = presented ?? toValue(options.min) ?? 0
    const delta = effectiveStep.value * multiplier
    const raw = direction === 'up' ? base + delta : base - delta
    const next = roundToPrecision(clamp(raw), [base, delta])
    // 步进总是消费编辑草稿：无论是否产生变化，展示都回到格式化生效值。
    editingText.value = null
    if (next === value.value) return // 边界上原地步进：无变化不发事件
    options.onChange?.(next)
    options.onStep?.(direction, next)
  }

  function toBound(edge: 'min' | 'max'): void {
    if (disabled.value) return
    const bound = edge === 'min' ? toValue(options.min) : toValue(options.max)
    if (bound === undefined) return
    applyValue(bound)
  }

  function handleInput(event: Event): void {
    editingText.value = (event.target as HTMLInputElement).value
  }

  function commit(): void {
    const draft = editingText.value
    editingText.value = null
    if (draft === null) return
    const parsed = parse(draft)
    // 无法解析（如 '-'+未完成的数字）：回退展示生效值，不发事件。
    if (parsed === undefined) return
    applyValue(parsed, [parsed as number])
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (disabled.value) return
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
      return
    }
    if (!INPUT_NUMBER_KEYS.includes(event.key)) return
    event.preventDefault()
    switch (event.key) {
      case 'ArrowUp':
        stepBy('up')
        break
      case 'ArrowDown':
        stepBy('down')
        break
      case 'PageUp':
        stepBy('up', INPUT_NUMBER_PAGE_STEP_MULTIPLIER)
        break
      case 'PageDown':
        stepBy('down', INPUT_NUMBER_PAGE_STEP_MULTIPLIER)
        break
      case 'Home':
        toBound('min')
        break
      case 'End':
        toBound('max')
        break
      default:
        break
    }
  }

  return {
    value,
    formatted,
    editingText,
    effectiveStep,
    effectivePrecision,
    clamp,
    parse,
    stepBy,
    toBound,
    handleInput,
    handleKeydown,
    commit,
  }
}
